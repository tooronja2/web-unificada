# Script simple para comprimir imágenes
Add-Type -AssemblyName System.Drawing

$sourceDir = "c:\Users\Usuario\Downloads\Elemento-3d-main\Elemento-3d-main\images"

Write-Host "Iniciando compresión de imágenes..." -ForegroundColor Green

# Crear backup si no existe
$backupDir = "$sourceDir\_backup"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Write-Host "Creando backup..." -ForegroundColor Yellow
    Copy-Item "$sourceDir\*.png" $backupDir -ErrorAction SilentlyContinue
    Copy-Item "$sourceDir\*.jpg" $backupDir -ErrorAction SilentlyContinue
    Copy-Item "$sourceDir\*.jpeg" $backupDir -ErrorAction SilentlyContinue
}

# Obtener tamaño inicial
$initialSize = (Get-ChildItem $sourceDir -Include "*.png", "*.jpg", "*.jpeg" | Measure-Object Length -Sum).Sum
Write-Host "Tamaño inicial: $([math]::Round($initialSize/1MB,2)) MB" -ForegroundColor Yellow

# Comprimir PNGs grandes convirtiéndolos a JPG
$largePngs = Get-ChildItem $sourceDir -Filter "*.png" | Where-Object { $_.Length -gt 50KB }

Write-Host "Convirtiendo $($largePngs.Count) archivos PNG a JPG..." -ForegroundColor Cyan

foreach ($png in $largePngs) {
    try {
        $img = [System.Drawing.Image]::FromFile($png.FullName)
        
        # Calcular nuevas dimensiones (máximo 1000px en el lado más largo)
        $maxDimension = 1000
        $ratio = [Math]::Min($maxDimension / $img.Width, $maxDimension / $img.Height)
        
        if ($ratio -lt 1) {
            $newWidth = [int]($img.Width * $ratio)
            $newHeight = [int]($img.Height * $ratio)
        } else {
            $newWidth = $img.Width
            $newHeight = $img.Height
        }
        
        # Crear nueva imagen redimensionada
        $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($newImg)
        $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
        
        # Configurar para JPG con calidad 75
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 75)
        
        # Guardar como JPG
        $jpgPath = $png.FullName -replace "\.png$", ".jpg"
        $newImg.Save($jpgPath, $jpegCodec, $encoderParams)
        
        # Limpiar memoria
        $graphics.Dispose()
        $newImg.Dispose()
        $img.Dispose()
        
        # Eliminar PNG original
        Remove-Item $png.FullName -Force
        
        Write-Host "  ✓ Convertido: $($png.Name)" -ForegroundColor Green
        
    } catch {
        Write-Host "  ✗ Error: $($png.Name)" -ForegroundColor Red
    }
}

# Comprimir JPGs grandes
$largeJpgs = Get-ChildItem $sourceDir -Include "*.jpg", "*.jpeg" | Where-Object { $_.Length -gt 200KB }

Write-Host "Comprimiendo $($largeJpgs.Count) archivos JPG grandes..." -ForegroundColor Cyan

foreach ($jpg in $largeJpgs) {
    try {
        $img = [System.Drawing.Image]::FromFile($jpg.FullName)
        
        # Redimensionar si es muy grande
        $maxDimension = 1200
        $ratio = [Math]::Min($maxDimension / $img.Width, $maxDimension / $img.Height)
        
        if ($ratio -lt 1) {
            $newWidth = [int]($img.Width * $ratio)
            $newHeight = [int]($img.Height * $ratio)
        } else {
            $newWidth = $img.Width
            $newHeight = $img.Height
        }
        
        $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($newImg)
        $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
        
        # Usar calidad 60 para archivos muy grandes
        $quality = if ($jpg.Length -gt 500KB) { 60 } else { 70 }
        
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
        
        $tempPath = "$($jpg.FullName).temp"
        $newImg.Save($tempPath, $jpegCodec, $encoderParams)
        
        $graphics.Dispose()
        $newImg.Dispose()
        $img.Dispose()
        
        # Reemplazar original si es más pequeño
        $newSize = (Get-Item $tempPath).Length
        if ($newSize -lt $jpg.Length) {
            Remove-Item $jpg.FullName -Force
            Move-Item $tempPath $jpg.FullName -Force
            Write-Host "  ✓ Comprimido: $($jpg.Name)" -ForegroundColor Green
        } else {
            Remove-Item $tempPath -Force
        }
        
    } catch {
        Write-Host "  ✗ Error: $($jpg.Name)" -ForegroundColor Red
        if (Test-Path "$($jpg.FullName).temp") {
            Remove-Item "$($jpg.FullName).temp" -Force
        }
    }
}

# Mostrar resultado final
$finalSize = (Get-ChildItem $sourceDir -Include "*.png", "*.jpg", "*.jpeg", "*.webp", "*.svg" | Measure-Object Length -Sum).Sum
$reduction = $initialSize - $finalSize

Write-Host "`n=== RESULTADO FINAL ===" -ForegroundColor Cyan
Write-Host "Tamaño inicial: $([math]::Round($initialSize/1MB,2)) MB" -ForegroundColor Yellow
Write-Host "Tamaño final: $([math]::Round($finalSize/1MB,2)) MB" -ForegroundColor Green
Write-Host "Reducción: $([math]::Round($reduction/1MB,2)) MB ($([math]::Round(($reduction/$initialSize)*100,1))%)" -ForegroundColor Cyan

if ($finalSize/1MB -lt 100) {
    Write-Host "`n🎉 ¡OBJETIVO CUMPLIDO! El proyecto ahora pesa menos de 100 MB" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Aún por encima de 100 MB. Tamaño actual: $([math]::Round($finalSize/1MB,2)) MB" -ForegroundColor Red
}

Write-Host "`nBackup creado en: $backupDir" -ForegroundColor Gray
