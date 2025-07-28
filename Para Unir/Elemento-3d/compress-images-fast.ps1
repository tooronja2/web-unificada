# Script optimizado para comprimir imágenes
Add-Type -AssemblyName System.Drawing

$sourceDir = "c:\Users\Usuario\Downloads\Elemento-3d-main\Elemento-3d-main\images"

Write-Host "Iniciando compresión de imágenes..." -ForegroundColor Green

# Obtener archivos grandes que necesitan compresión
$largeImages = Get-ChildItem $sourceDir -Include "*.png", "*.jpg", "*.jpeg" | Where-Object { $_.Length -gt 200KB }

Write-Host "Encontradas $($largeImages.Count) imágenes grandes para comprimir..." -ForegroundColor Yellow

$totalSaved = 0
$processed = 0

foreach ($image in $largeImages) {
    $originalSize = $image.Length
    
    try {
        # Crear imagen temporal comprimida
        $tempFile = "$($image.FullName).temp"
        
        # Usar comando de Windows integrado para redimensionar
        $img = [System.Drawing.Image]::FromFile($image.FullName)
        
        # Calcular nuevo tamaño (máximo 1200px en el lado más largo)
        $maxSize = 1200
        $ratio = [Math]::Min($maxSize / $img.Width, $maxSize / $img.Height)
        
        if ($ratio -lt 1) {
            $newWidth = [int]($img.Width * $ratio)
            $newHeight = [int]($img.Height * $ratio)
        } else {
            $newWidth = $img.Width
            $newHeight = $img.Height
        }
        
        # Crear nueva imagen
        $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($newImg)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
        
        # Guardar como JPEG con calidad 70
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 70)
        
        # Si es PNG, cambiar extensión a JPG
        if ($image.Extension.ToLower() -eq ".png") {
            $newPath = $image.FullName -replace "\.png$", ".jpg"
        } else {
            $newPath = $image.FullName
        }
        
        $newImg.Save($tempFile, $jpegCodec, $encoderParams)
        
        $graphics.Dispose()
        $newImg.Dispose()
        $img.Dispose()
        
        $newSize = (Get-Item $tempFile).Length
        
        # Si el archivo comprimido es más pequeño, reemplazar el original
        if ($newSize -lt $originalSize) {
            Remove-Item $image.FullName -Force
            Move-Item $tempFile $newPath -Force
            
            $saved = $originalSize - $newSize
            $totalSaved += $saved
            $processed++
            
            Write-Host "  ✓ $($image.Name): $([math]::Round($saved/1KB,1))KB ahorrados" -ForegroundColor Green
        } else {
            Remove-Item $tempFile -Force
        }
        
    } catch {
        Write-Host "  ✗ Error en $($image.Name): $($_.Exception.Message)" -ForegroundColor Red
        if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
    }
}

# Mostrar resultados
$currentSize = (Get-ChildItem $sourceDir | Measure-Object Length -Sum).Sum
Write-Host "`n=== RESULTADOS ===" -ForegroundColor Cyan
Write-Host "Imágenes procesadas: $processed" -ForegroundColor White
Write-Host "Espacio ahorrado: $([math]::Round($totalSaved/1MB,2)) MB" -ForegroundColor Green
Write-Host "Tamaño actual total: $([math]::Round($currentSize/1MB,2)) MB" -ForegroundColor Yellow

if ($currentSize/1MB -lt 100) {
    Write-Host "🎉 ¡OBJETIVO CUMPLIDO! El proyecto ahora pesa menos de 100 MB" -ForegroundColor Green
} else {
    Write-Host "⚠️ Aún por encima de 100 MB. Realizando compresión adicional..." -ForegroundColor Yellow
    
    # Segunda pasada con compresión más agresiva
    $stillLarge = Get-ChildItem $sourceDir -Include "*.jpg", "*.jpeg" | Where-Object { $_.Length -gt 100KB }
    
    foreach ($image in $stillLarge) {
        try {
            $tempFile = "$($image.FullName).temp2"
            $img = [System.Drawing.Image]::FromFile($image.FullName)
            
            # Redimensionar a máximo 800px
            $maxSize = 800
            $ratio = [Math]::Min($maxSize / $img.Width, $maxSize / $img.Height)
            
            $newWidth = [int]($img.Width * $ratio)
            $newHeight = [int]($img.Height * $ratio)
            
            $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $graphics = [System.Drawing.Graphics]::FromImage($newImg)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
            
            # Calidad más baja: 50
            $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 50)
            
            $newImg.Save($tempFile, $jpegCodec, $encoderParams)
            
            $graphics.Dispose()
            $newImg.Dispose()
            $img.Dispose()
            
            $originalSize = $image.Length
            $newSize = (Get-Item $tempFile).Length
            
            if ($newSize -lt $originalSize) {
                Remove-Item $image.FullName -Force
                Move-Item $tempFile $image.FullName -Force
                Write-Host "  ✓ Compresión adicional: $($image.Name)" -ForegroundColor Yellow
            } else {
                Remove-Item $tempFile -Force
            }
            
        } catch {
            if (Test-Path $tempFile) { Remove-Item $tempFile -Force }
        }
    }
}

# Resultado final
$finalSize = (Get-ChildItem $sourceDir | Measure-Object Length -Sum).Sum
Write-Host "`n=== RESULTADO FINAL ===" -ForegroundColor Cyan
Write-Host "Tamaño final del proyecto: $([math]::Round($finalSize/1MB,2)) MB" -ForegroundColor $(if ($finalSize/1MB -lt 100) { "Green" } else { "Red" })

if ($finalSize/1MB -lt 100) {
    Write-Host "✅ Proyecto optimizado exitosamente!" -ForegroundColor Green
} else {
    Write-Host "❌ Se requiere optimización manual adicional" -ForegroundColor Red
}
