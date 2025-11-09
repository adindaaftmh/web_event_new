<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\DaftarHadir;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class UserController extends Controller
{
    /**
     * Get all users with statistics (Admin only)
     */
    public function getAllUsers(Request $request)
    {
        try {
            // Check if user is admin
            $currentUser = $request->user();
            // Temporary: Comment out admin check for testing
            // if (!$currentUser || $currentUser->role !== 'admin') {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Unauthorized. Admin access required.'
            //     ], 403);
            // }

            // Get all users
            $users = User::orderBy('created_at', 'desc')->get();
            
            // Add statistics for each user
            $usersWithStats = $users->map(function ($user) {
                $eventsCount = DaftarHadir::where('user_id', $user->id)->count();
                $totalSpending = DaftarHadir::where('user_id', $user->id)->sum('total_harga') ?? 0;
                
                return [
                    'id' => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email' => $user->email,
                    'no_telepon' => $user->no_handphone,
                    'created_at' => $user->created_at,
                    'status' => $this->mapStatus($user->status_akun),
                    'role' => $user->role ?? 'user',
                    'last_login_at' => $user->updated_at,
                    'events_count' => (int) $eventsCount,
                    'total_spending' => (int) $totalSpending,
                    'profile_image' => $user->profile_image ? url($user->profile_image) : null
                ];
            });

            Log::info('Total users fetched: ' . $usersWithStats->count());

            return response()->json($usersWithStats);

        } catch (\Exception $e) {
            Log::error('Error fetching users: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Map status from database format to frontend format
     */
    private function mapStatus($dbStatus)
    {
        $statusMap = [
            'aktif' => 'active',
            'nonaktif' => 'inactive',
            'pending' => 'pending',
            'active' => 'active',
            'inactive' => 'inactive'
        ];

        return $statusMap[strtolower($dbStatus)] ?? 'active';
    }

    /**
     * Map status from frontend format to database format
     */
    private function mapStatusToDb($frontendStatus)
    {
        $statusMap = [
            'active' => 'aktif',
            'inactive' => 'nonaktif',
            'pending' => 'pending'
        ];

        return $statusMap[strtolower($frontendStatus)] ?? 'aktif';
    }

    /**
     * Update user status (Admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            // Check if user is admin
            $currentUser = $request->user();
            // Temporary: Comment out admin check for testing
            // if (!$currentUser || $currentUser->role !== 'admin') {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Unauthorized. Admin access required.'
            //     ], 403);
            // }

            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:active,inactive,pending'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Find user
            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan'
                ], 404);
            }

            // Update status
            $user->status_akun = $this->mapStatusToDb($request->status);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Status pengguna berhasil diperbarui',
                'data' => [
                    'id' => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email' => $user->email,
                    'status' => $this->mapStatus($user->status_akun)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate status pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset user password (Admin only)
     */
    public function resetPassword(Request $request, $id)
    {
        try {
            // Check if user is admin
            $currentUser = $request->user();
            // Temporary: Comment out admin check for testing
            // if (!$currentUser || $currentUser->role !== 'admin') {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Unauthorized. Admin access required.'
            //     ], 403);
            // }

            $validator = Validator::make($request->all(), [
                'password' => 'required|string|min:6'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed. Password minimal 6 karakter.',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Find user
            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan'
                ], 404);
            }

            // Update password
            $user->password = Hash::make($request->password);
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil direset',
                'data' => [
                    'id' => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email' => $user->email
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mereset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user detail with full statistics (Admin only)
     */
    public function getUserDetail(Request $request, $id)
    {
        try {
            // Check if user is admin
            $currentUser = $request->user();
            // Temporary: Comment out admin check for testing
            // if (!$currentUser || $currentUser->role !== 'admin') {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Unauthorized. Admin access required.'
            //     ], 403);
            // }

            // Find user
            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan'
                ], 404);
            }

            // Get user statistics
            $eventsCount = DaftarHadir::where('user_id', $user->id)->count();
            $totalSpending = DaftarHadir::where('user_id', $user->id)->sum('total_harga');
            
            // Get recent events
            $recentEvents = DaftarHadir::where('user_id', $user->id)
                ->with('kegiatan')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($daftar) {
                    return [
                        'event_name' => $daftar->kegiatan->nama_kegiatan ?? '-',
                        'date' => $daftar->created_at,
                        'status' => $daftar->status_kehadiran
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email' => $user->email,
                    'no_telepon' => $user->no_handphone,
                    'alamat' => $user->alamat,
                    'pendidikan_terakhir' => $user->pendidikan_terakhir,
                    'profile_image' => $user->profile_image ? url($user->profile_image) : null,
                    'status' => $this->mapStatus($user->status_akun),
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'events_count' => $eventsCount,
                    'total_spending' => $totalSpending,
                    'recent_events' => $recentEvents
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export users to Excel (Admin only)
     */
    public function exportUsersToExcel(Request $request)
    {
        try {
            // Check if user is admin
            $currentUser = $request->user();
            if (!$currentUser || $currentUser->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            // Get all users
            $users = User::orderBy('created_at', 'desc')->get();

            // Create new Spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set document properties
            $spreadsheet->getProperties()
                ->setCreator('Event Management System')
                ->setTitle('Daftar Akun Pengguna')
                ->setSubject('User Accounts Export')
                ->setDescription('Export data akun pengguna dari sistem');

            // Set header row
            $headers = [
                'No',
                'ID',
                'Nama Lengkap',
                'Email',
                'No. Telepon',
                'Alamat',
                'Pendidikan Terakhir',
                'Role',
                'Status Akun',
                'Event Diikuti',
                'Total Pengeluaran (Rp)',
                'Tanggal Daftar',
                'Last Login'
            ];

            // Write headers
            $column = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($column . '1', $header);
                $column++;
            }

            // Style header row
            $headerStyle = [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4A7FA7']
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ];
            $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);

            // Write data rows
            $row = 2;
            $no = 1;
            foreach ($users as $user) {
                // Get statistics
                $eventsCount = DaftarHadir::where('user_id', $user->id)->count();
                $totalSpending = DaftarHadir::where('user_id', $user->id)->sum('total_harga') ?? 0;

                $sheet->setCellValue('A' . $row, $no);
                $sheet->setCellValue('B' . $row, $user->id);
                $sheet->setCellValue('C' . $row, $user->nama_lengkap);
                $sheet->setCellValue('D' . $row, $user->email);
                $sheet->setCellValue('E' . $row, $user->no_handphone ?? '-');
                $sheet->setCellValue('F' . $row, $user->alamat ?? '-');
                $sheet->setCellValue('G' . $row, $user->pendidikan_terakhir ?? '-');
                $sheet->setCellValue('H' . $row, ucfirst($user->role ?? 'user'));
                $sheet->setCellValue('I' . $row, ucfirst($this->mapStatus($user->status_akun)));
                $sheet->setCellValue('J' . $row, $eventsCount);
                $sheet->setCellValue('K' . $row, 'Rp ' . number_format($totalSpending, 0, ',', '.'));
                $sheet->setCellValue('L' . $row, $user->created_at->format('d/m/Y H:i'));
                $sheet->setCellValue('M' . $row, $user->updated_at ? $user->updated_at->format('d/m/Y H:i') : '-');

                $row++;
                $no++;
            }

            // Style data rows
            $dataStyle = [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC']
                    ]
                ]
            ];
            $sheet->getStyle('A2:M' . ($row - 1))->applyFromArray($dataStyle);

            // Auto-size columns
            foreach (range('A', 'M') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            // Set row height for header
            $sheet->getRowDimension(1)->setRowHeight(25);

            // Freeze header row
            $sheet->freezePane('A2');

            // Generate filename with timestamp
            $filename = 'Daftar_Akun_Pengguna_' . date('Y-m-d_His') . '.xlsx';

            // Save to temporary file
            $tempFile = tempnam(sys_get_temp_dir(), 'excel_');
            $writer = new Xlsx($spreadsheet);
            $writer->save($tempFile);

            // Return file as download
            return response()->download($tempFile, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error('Error exporting users to Excel: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal export data pengguna',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
