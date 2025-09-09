<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdorableHelper
{
    private static int $DEFAULT_SIZE = 800;

    private static array $colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
        '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71'
    ];

    public static function getProfilePicture($identifier = null, $size = 800): string
    {
        if (!$identifier) {
            $identifier = auth()->id() ?? Str::random();
        }

        $values = static::hashValues($identifier);
        $cacheKey = "avatarprovider.avatar." . hash('sha256', $identifier . $size . json_encode($values));

        return Cache::remember($cacheKey, now()->addDay(), function () use ($values, $size) {
            return static::generateAvatar($values, $size);
        });
    }

    private static function hashValues($identifier): array
    {
        return [
            'background' => static::getValue(static::$colors, $identifier),
            'eyes' => static::getValue(static::getFiles('eyes'), $identifier),
            'noses' => static::getValue(static::getFiles('noses'), $identifier),
            'mouths' => static::getValue(static::getFiles('mouths'), $identifier),
        ];
    }

    private static function getFiles($type): array
    {
        return array_slice(scandir(public_path("assets/img/adorable/$type")), 2);
    }

    private static function getValue(array $array, string $key)
    {
        if (empty($array)) return null;
        $hash = static::calculateHash($key);
        return $array[$hash % count($array)];
    }

    private static function calculateHash(string $key): int
    {
        return array_sum(array_map(function ($char) {
            return mb_ord($char);
        }, str_split($key)));
    }

    private static function generateAvatar(array $values, int $size): string
    {
        $image = imagecreatetruecolor($size, $size);

        imagealphablending($image, true);
        imagesavealpha($image, true);

        $bgColor = static::hex2rgb($values['background']);
        $backgroundColor = imagecolorallocate($image, $bgColor['r'], $bgColor['g'], $bgColor['b']);
        imagefill($image, 0, 0, $backgroundColor);

        static::insertFeature($image, $values['eyes'], 'eyes', $size);
        static::insertFeature($image, $values['noses'], 'noses', $size);
        static::insertFeature($image, $values['mouths'], 'mouths', $size);

        ob_start();
        imagepng($image);
        $imageData = ob_get_clean();
        imagedestroy($image);

        return 'data:image/png;base64,' . base64_encode($imageData);
    }

    private static function insertFeature($image, $filename, $type, $size): void
    {
        if ($filename) {
            $path = public_path("assets/img/adorable/$type/$filename");
            if (file_exists($path)) {
                $feature = imagecreatefrompng($path);
                imagealphablending($feature, true);
                imagesavealpha($feature, true);

                $featureWidth = imagesx($feature);
                $featureHeight = imagesy($feature);

                $x = ($size - $featureWidth) / 2;
                $y = ($size - $featureHeight) / 2;

                imagecopy(
                    $image,
                    $feature,
                    (int)$x,
                    (int)$y,
                    0,
                    0,
                    $featureWidth,
                    $featureHeight
                );

                imagedestroy($feature);
            }
        }
    }

    private static function hex2rgb($hex): array
    {
        $hex = ltrim($hex, '#');
        return [
            'r' => hexdec(substr($hex, 0, 2)),
            'g' => hexdec(substr($hex, 2, 2)),
            'b' => hexdec(substr($hex, 4, 2))
        ];
    }
}
