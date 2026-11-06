<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-admin-auth');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || empty($data['base64Data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No media data provided.']);
    exit();
}

// 1. Authenticate Request
$headers = function_exists('getallheaders') ? getallheaders() : [];
$adminToken = $data['adminToken'] ?? '';
$xAdminAuth = $headers['x-admin-auth'] ?? $headers['X-Admin-Auth'] ?? '';
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

$isAuthorized = ($adminToken === 'faminas-authorized-admin-session' || $xAdminAuth === 'true' || !empty($authHeader));

if (!$isAuthorized) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized: Administrator privileges required.']);
    exit();
}

// 2. Validate MIME Type (Images & Videos)
$base64Data = $data['base64Data'];
if (!preg_match('/^data:((?:image\/(?:jpeg|png|webp|jpg|gif|svg\+xml))|(?:video\/(?:mp4|webm|quicktime|ogg)));base64,/i', $base64Data, $matches)) {
    http_response_code(400);
    echo json_encode(['error' => 'Unsupported format. Please upload JPG, PNG, WebP, GIF, SVG images or MP4/WebM videos.']);
    exit();
}

$mimeType = strtolower($matches[1]);
$extension = 'jpg';
if (strpos($mimeType, 'png') !== false) {
    $extension = 'png';
} elseif (strpos($mimeType, 'webp') !== false) {
    $extension = 'webp';
} elseif (strpos($mimeType, 'gif') !== false) {
    $extension = 'gif';
} elseif (strpos($mimeType, 'svg') !== false) {
    $extension = 'svg';
} elseif (strpos($mimeType, 'mp4') !== false) {
    $extension = 'mp4';
} elseif (strpos($mimeType, 'webm') !== false) {
    $extension = 'webm';
} elseif (strpos($mimeType, 'quicktime') !== false) {
    $extension = 'mov';
}

// 3. Decode & Validate Size (Max 50MB)
$cleanBase64 = preg_replace('/^data:[a-zA-Z0-9\/+-]+;base64,/', '', $base64Data);
$binaryData = base64_decode($cleanBase64);

if ($binaryData === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid media encoding.']);
    exit();
}

if (strlen($binaryData) > 50 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'File size exceeds maximum allowable limit of 50MB.']);
    exit();
}

// 4. Determine Destination Directory on Hostinger Shared Hosting
$folder = $data['folder'] ?? 'cms_media';
$safeFolder = preg_replace('/[^a-zA-Z0-9_-]/', '_', $folder);
$targetDir = __DIR__ . '/../uploads/' . $safeFolder;

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$rawFilename = $data['filename'] ?? ('media_' . time() . '.' . $extension);
$cleanFilename = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($rawFilename, PATHINFO_FILENAME));
$uniqueFilename = time() . '-' . $cleanFilename . '.' . $extension;
$destinationPath = $targetDir . '/' . $uniqueFilename;

if (file_put_contents($destinationPath, $binaryData) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save uploaded file to hosting disk.']);
    exit();
}

$publicUrl = '/uploads/' . $safeFolder . '/' . $uniqueFilename;

echo json_encode([
    'success' => true,
    'url' => $publicUrl,
    'filename' => $uniqueFilename,
    'provider' => 'hostinger_storage'
]);

