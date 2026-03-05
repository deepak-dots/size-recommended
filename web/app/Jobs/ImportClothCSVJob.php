<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ImportClothCSVJob implements ShouldQueue
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
      
        $fullPath = storage_path('app/' . $this->path); // Correct for local files

        $file = fopen($fullPath, 'r');

        $header = fgetcsv($file);

        while ($row = fgetcsv($file)) {
            $rowData = array_combine($header, $row);

            ImportClothRowJob::dispatch($rowData); // Use correct job class
        }

        fclose($file);
    }
}
