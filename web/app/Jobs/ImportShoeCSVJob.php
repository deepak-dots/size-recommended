<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ImportShoeCSVJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;

    protected string $path;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(string $path)
    {
        $this->path = $path;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if (!Storage::disk('local')->exists($this->path)) {
            throw new \Exception('Import file not found');
        }

        $file = Storage::disk('local')->get($this->path);

        $rows = array_map('str_getcsv', explode(PHP_EOL, trim($file)));

        $headers = array_map('trim', array_shift($rows));

        foreach (array_chunk($rows, 500) as $chunk) {
            foreach ($chunk as $row) {
                if (count($row) !== count($headers)) {
                    continue;
                }
                $rowData = array_combine($headers, $row);
                ImportShoeRowJob::dispatch($rowData);
            }
        }
    }
}
