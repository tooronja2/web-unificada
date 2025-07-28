# Script para comprimir imágenes y reducir el tamaño del proyecto
# Objetivo: reducir de 113+ MB a menos de 100 MB

Add-Type -AssemblyName System.Drawing

$sourceDir = "c:\Users\Usuario\Downloads\Elemento-3d-main\Elemento-3d-main\images"
$backupDir = "c:\Users\Usuario\Downloads\Elemento-3d-main\Elemento-3d-main\images_backup"

# Crear directorio de respaldo
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
    Write-Host "Creando respaldo de imágenes originales en: $backupDir"
    Copy-Item "$sourceDir\*" $backupDir -Force
}

function Compress-Image {
    param(
        [string]$inputPath,
        [string]$outputPath,
        [int]$quality = 75,
        [int]$maxWidth = 1920,
        [int]$maxHeight = 1080
    )
    
    try {
        $image = [System.Drawing.Image]::FromFile($inputPath)
        $originalSize = (Get-Item $inputPath).Length
        
        # Calcular nuevas dimensiones manteniendo la proporción
        $ratioX = $maxWidth / $image.Width
        $ratioY = $maxHeight / $image.Height
        $ratio = [Math]::Min($ratioX, $ratioY)
        
        if ($ratio -lt 1) {
            $newWidth = [int]($image.Width * $ratio)
            $newHeight = [int]($image.Height * $ratio)
        } else {
            $newWidth = $image.Width
            $newHeight = $image.Height
        }
        
        # Crear nueva imagen redimensionada
        $newImage = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($image, 0, 0, $newWidth, $newHeight)
        
        # Configurar codec y parámetros de calidad
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
        
        # Guardar imagen comprimida
        $newImage.Save($outputPath, $jpegCodec, $encoderParams)
        
        $newSize = (Get-Item $outputPath).Length
        $reduction = [math]::Round((($originalSize - $newSize) / $originalSize) * 100, 2)
        
        Write-Host "  Comprimido: $(Split-Path $inputPath -Leaf) - Reducción: $reduction% ($(([math]::Round($originalSize/1KB,1)))KB → $(([math]::Round($newSize/1KB,1)))KB)"
        
        $graphics.Dispose()
        $newImage.Dispose()
        $image.Dispose()
        
        return $true
    }
    catch {
        Write-Host "  Error procesando $(Split-Path $inputPath -Leaf): $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Obtener todas las imágenes
$images = Get-ChildItem $sourceDir -Include "*.jpg", "*.jpeg", "*.png" -Recurse

Write-Host "Procesando $($images.Count) imágenes..." -ForegroundColor Green
Write-Host "Tamaño original total: $([math]::Round((($images | Measure-Object Length -Sum).Sum)/1MB,2)) MB" -ForegroundColor Yellow

$processedCount = 0
$totalOriginalSize = 0
$totalNewSize = 0

foreach ($image in $images) {
    $totalOriginalSize += $image.Length
    
    # Determinar estrategia de compresión según el archivo
    $fileName = $image.BaseName
    $extension = $image.Extension.ToLower()
    
    # Para imágenes grandes (>500KB), usar compresión más agresiva
    $quality = if ($image.Length -gt 500KB) { 60 } else { 75 }
    $maxWidth = if ($image.Length -gt 1MB) { 1200 } else { 1600 }
    $maxHeight = if ($image.Length -gt 1MB) { 800 } else { 1200 }
    
    # Si es PNG grande, convertir a JPG, sino mantener formato original
    if ($extension -eq ".png" -and $image.Length -gt 100KB) {
        $outputPath = Join-Path $sourceDir "$fileName.jpg"
        if (Compress-Image -inputPath $image.FullName -outputPath $outputPath -quality $quality -maxWidth $maxWidth -maxHeight $maxHeight) {
            Remove-Item $image.FullName -Force
            $processedCount++
        }
    }
    elseif ($extension -eq ".jpg" -or $extension -eq ".jpeg") {
        $tempPath = Join-Path $sourceDir "$fileName.temp$extension"
        if (Compress-Image -inputPath $image.FullName -outputPath $tempPath -quality $quality -maxWidth $maxWidth -maxHeight $maxHeight) {
            Remove-Item $image.FullName -Force
            Move-Item $tempPath $image.FullName -Force
            $processedCount++
        }
    }
}

# Calcular nuevo tamaño total
$newImages = Get-ChildItem $sourceDir -Include "*.jpg", "*.jpeg", "*.png" -Recurse
$totalNewSize = ($newImages | Measure-Object Length -Sum).Sum

Write-Host "`nResultados:" -ForegroundColor Green
Write-Host "Imágenes procesadas: $processedCount" -ForegroundColor White
Write-Host "Tamaño original: $([math]::Round($totalOriginalSize/1MB,2)) MB" -ForegroundColor Yellow
Write-Host "Tamaño nuevo: $([math]::Round($totalNewSize/1MB,2)) MB" -ForegroundColor Green
Write-Host "Reducción total: $([math]::Round((($totalOriginalSize - $totalNewSize) / $totalOriginalSize) * 100, 2))%" -ForegroundColor Cyan

if ($totalNewSize/1MB -lt 100) {
    Write-Host "¡Objetivo cumplido! El proyecto ahora pesa menos de 100 MB." -ForegroundColor Green
} else {
    Write-Host "Aún necesita más optimización. Tamaño actual: $([math]::Round($totalNewSize/1MB,2)) MB" -ForegroundColor Yellow
}

Write-Host "`nNota: Las imágenes originales se guardaron en: $backupDir" -ForegroundColor Cyan
