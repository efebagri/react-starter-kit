<?php

namespace App\Console\Commands;

use App\Services\GeoIpService;
use Illuminate\Console\Command;

class TestGeoIpCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'geoip:test {ip?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test GeoIP functionality and database availability';

    /**
     * Execute the console command.
     */
    public function handle(GeoIpService $geoIpService): int
    {
        $this->info('GeoIP Test Command');
        $this->info('=================');

        // Check database availability
        $dbInfo = $geoIpService->getDatabaseInfo();
        
        $this->info('Database Status:');
        $this->table(['Database', 'Available', 'File Exists', 'Path'], [
            ['City', $dbInfo['city']['available'] ? '✓' : '✗', $dbInfo['city']['exists'] ? '✓' : '✗', $dbInfo['city']['path']],
            ['Country', $dbInfo['country']['available'] ? '✓' : '✗', $dbInfo['country']['exists'] ? '✓' : '✗', $dbInfo['country']['path']],
            ['ASN', $dbInfo['asn']['available'] ? '✓' : '✗', $dbInfo['asn']['exists'] ? '✓' : '✗', $dbInfo['asn']['path']],
        ]);

        if (!$dbInfo['city']['available'] && !$dbInfo['country']['available']) {
            $this->error('No GeoIP databases are available!');
            $this->info('Please place your GeoLite2 database files in: ' . storage_path('app/geoip/'));
            $this->info('Required files:');
            $this->info('- GeoLite2-City.mmdb (for city-level lookup)');
            $this->info('- GeoLite2-Country.mmdb (for country-level lookup)');
            $this->info('- GeoLite2-ASN.mmdb (for ASN lookup)');
            
            return Command::FAILURE;
        }

        // Test with provided IP or default test IPs
        $testIp = $this->argument('ip');
        
        if ($testIp) {
            $testIps = [$testIp];
        } else {
            $testIps = [
                '8.8.8.8',          // Google DNS (US)
                '1.1.1.1',          // Cloudflare (US)
                '208.67.222.222',   // OpenDNS (US)
                '94.130.180.12',    // Hetzner (Germany)
                '185.199.108.153',  // GitHub (Global CDN)
            ];
        }

        $this->info("\nTesting IP Locations:");
        $this->info('====================');

        foreach ($testIps as $ip) {
            $fullInfo = $geoIpService->getFullInfo($ip);
            $formatted = $geoIpService->getFormattedLocation($ip);

            $this->info("IP: {$ip}");
            
            if ($fullInfo['success'] ?? false) {
                $this->line("  ✓ Status: Success");
                $this->line("  City: " . ($fullInfo['city'] ?? 'Unknown'));
                $this->line("  Country: " . ($fullInfo['country'] ?? 'Unknown'));
                $this->line("  Country Code: " . ($fullInfo['country_code'] ?? 'Unknown'));
                $this->line("  ASN: " . ($fullInfo['asn'] ?? 'Unknown'));
                $this->line("  Organization: " . ($fullInfo['organization'] ?? 'Unknown'));
                $this->line("  Formatted: " . ($formatted ?? 'Unknown'));
                
                if (isset($fullInfo['asn_warning'])) {
                    $this->warn("  ASN Warning: " . $fullInfo['asn_warning']);
                }
            } else {
                $this->line("  ✗ Status: Failed");
                if (isset($fullInfo['error'])) {
                    $this->error("  Error: " . $fullInfo['error']);
                }
            }
            
            $this->line('');
        }

        // Test error scenarios
        $this->info("\nTesting Error Scenarios:");
        $this->info('========================');
        
        $errorTestIps = [
            'invalid-ip' => 'Invalid format',
            '192.168.1.1' => 'Private IP',
            '127.0.0.1' => 'Localhost',
            '::1' => 'IPv6 localhost',
        ];
        
        foreach ($errorTestIps as $ip => $description) {
            $fullInfo = $geoIpService->getFullInfo($ip);
            
            $this->info("IP: {$ip} ({$description})");
            $this->line("  ✗ Status: Failed (Expected)");
            if (isset($fullInfo['error'])) {
                $this->line("  Error: " . $fullInfo['error']);
            }
            $this->line('');
        }

        $this->info('Test completed successfully!');
        return Command::SUCCESS;
    }
}
