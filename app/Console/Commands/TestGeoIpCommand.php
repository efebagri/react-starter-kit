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
        ]);

        if (!$dbInfo['city']['available'] && !$dbInfo['country']['available']) {
            $this->error('No GeoIP databases are available!');
            $this->info('Please place your GeoLite2 database files in: ' . storage_path('app/geoip/'));
            $this->info('Required files:');
            $this->info('- GeoLite2-City.mmdb (for city-level lookup)');
            $this->info('- GeoLite2-Country.mmdb (for country-level lookup)');
            
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
            $location = $geoIpService->getLocation($ip);
            $formatted = $geoIpService->getFormattedLocation($ip);

            $this->info("IP: {$ip}");
            $this->line("  City: " . ($location['city'] ?? 'Unknown'));
            $this->line("  Country: " . ($location['country'] ?? 'Unknown'));
            $this->line("  Country Code: " . ($location['country_code'] ?? 'Unknown'));
            $this->line("  Formatted: " . ($formatted ?? 'Unknown'));
            $this->line('');
        }

        $this->info('Test completed successfully!');
        return Command::SUCCESS;
    }
}
