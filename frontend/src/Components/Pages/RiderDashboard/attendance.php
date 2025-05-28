<?php
/**
 * Rider Attendance Page
 * Allows riders to view and mark their attendance with swipe to check-in/check-out
 */

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define BASEPATH to allow direct access
define('BASEPATH', true);
// Define ACCESS_ALLOWED to allow header inclusion
define('ACCESS_ALLOWED', true);

// Include initialization file
require_once '../includes/init.php'; // Assuming this sets up $auth, $db, USER_RIDER, sanitize(), redirect()

// Include models
require_once '../includes/models/Assignment.php'; // Assuming this defines Assignment class
// Assuming Rider and Attendance models are also included or autoloaded via init.php
// require_once '../includes/models/Rider.php';
// require_once '../includes/models/Attendance.php';


// Check if user is logged in and is a rider
if (!$auth->isLoggedIn() || $_SESSION['user_type'] !== USER_RIDER) {
    redirect('../login.php');
}

// Get current user
$user = $auth->getCurrentUser();

// Get rider data
$rider_model = new Rider($db); // Assuming Rider class constructor takes $db
$rider = $rider_model->getRiderByUserId($user['id']);

if (!$rider) {
    // If rider record doesn't exist, show error message and redirect to login
    $_SESSION['error'] = 'Rider profile not found. Please contact administrator.';
    redirect('../login.php');
}

// Initialize models
$attendance_model = new Attendance($db); // Assuming Attendance class constructor takes $db
$assignment_model = new Assignment($db);

// Get rider's current assignment
$current_assignment = $assignment_model->getCurrentAssignment($rider['id']);

// Process form submissions for check-in/check-out
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        $errors = [];
        $success = [];

        switch ($_POST['action']) {
            case 'check_in':
                $date = date('Y-m-d');
                $time = date('Y-m-d H:i:s'); // Use full datetime format
                
                $today_attendance = $attendance_model->getTodayAttendance($rider['id'], $date);
                // Allow check-in if not checked in OR if marked absent but not yet checked-in
                if ($today_attendance && !empty($today_attendance['check_in_time']) && $today_attendance['status'] !== 'absent') { 
                    $errors[] = 'You have already checked in today.';
                } else {
                    $attendance_data = [
                        'rider_id' => $rider['id'],
                        'company_id' => $current_assignment ? $current_assignment['company_id'] : 0,
                        'store_id' => $current_assignment ? $current_assignment['store_id'] : null,
                        'attendance_date' => $date,
                        'check_in_time' => $time,
                        'status' => 'present',
                        'marked_by' => $user['id']
                    ];
                    // If there was an 'absent' record for today without check-in/out, update it. Otherwise, create new.
                    if ($today_attendance && $today_attendance['status'] === 'absent' && empty($today_attendance['check_in_time'])) {
                        $attendance_data['id'] = $today_attendance['id'];
                        $attendance_data['remarks'] = $today_attendance['remarks']; // Preserve original absent reason if any
                        $result = $attendance_model->updateAttendance($attendance_data);
                    } else {
                        $result = $attendance_model->markAttendance($attendance_data);
                    }

                    if ($result) {
                        $success[] = 'Check-in successful at ' . date('h:i A');
                    } else {
                        $errors[] = 'Failed to check in. Please try again.';
                    }
                }
                break;

            case 'check_out':
                $date = date('Y-m-d');
                $time = date('Y-m-d H:i:s');
                
                $today_attendance = $attendance_model->getTodayAttendance($rider['id'], $date);
                if (!$today_attendance || empty($today_attendance['check_in_time'])) {
                    $errors[] = 'You need to check in first before checking out.';
                } elseif (!empty($today_attendance['check_out_time'])) {
                    $errors[] = 'You have already checked out today.';
                } else {
                    $attendance_data = [
                        'id' => $today_attendance['id'],
                        'check_out_time' => $time
                    ];
                    $result = $attendance_model->updateAttendance($attendance_data);
                    if ($result) {
                        $success[] = 'Check-out successful at ' . date('h:i A');
                    } else {
                        $errors[] = 'Failed to check out. Please try again.';
                    }
                }
                break;

            case 'mark_absent':
                $date = date('Y-m-d');
                $reason = sanitize($_POST['reason'] ?? '');

                $today_attendance = $attendance_model->getTodayAttendance($rider['id'], $date);
                if ($today_attendance && ($today_attendance['status'] === 'present' || !empty($today_attendance['check_in_time']))) {
                    $errors[] = 'You have already checked in today and cannot be marked as absent.';
                } else {
                     $attendance_data = [
                        'rider_id' => $rider['id'],
                        'company_id' => $current_assignment ? $current_assignment['company_id'] : 0,
                        'store_id' => $current_assignment ? $current_assignment['store_id'] : null,
                        'attendance_date' => $date,
                        'status' => 'absent',
                        'remarks' => $reason,
                        'marked_by' => $user['id'],
                        'check_in_time' => null, 
                        'check_out_time' => null 
                    ];
                    if($today_attendance && empty($today_attendance['check_in_time'])){ 
                        $attendance_data['id'] = $today_attendance['id'];
                        $result = $attendance_model->updateAttendance($attendance_data);
                    } else { 
                        $result = $attendance_model->markAttendance($attendance_data);
                    }

                    if ($result) {
                        $success[] = 'You have been marked as absent for today.';
                    } else {
                        $errors[] = 'Failed to mark as absent. Please try again.';
                    }
                }
                break;
        }

        if (!empty($errors)) {
            $_SESSION['error'] = implode('<br>', $errors);
        }
        if (!empty($success)) {
            $_SESSION['success'] = implode('<br>', $success);
        }
        redirect('rider/attendance.php'); 
    }
}

$today_attendance = $attendance_model->getTodayAttendance($rider['id'], date('Y-m-d'));
$selected_month = isset($_GET['month']) ? $_GET['month'] : date('Y-m');
$month_attendance = $attendance_model->getMonthAttendance($rider['id'], $selected_month);

$available_months = [];
for ($i = 0; $i <= 6; $i++) {
    $month_key = date('Y-m', strtotime("-$i months"));
    $available_months[$month_key] = date('F Y', strtotime($month_key));
}
$page_title = 'Attendance';
include '../includes/rider_header.php';
?>
<style>
    :root {
        --app-primary-color: #1976D2;
        --app-success-color: #4CAF50;
        --app-error-color: #F44336;
        --app-grey-light: #BDBDBD;
        --app-text-color-primary: #212121;
        --app-text-color-secondary: #757575;
        --app-card-background-color: #FFFFFF;
        --app-border-radius: 8px;
        --app-card-shadow: 0 2px 4px rgba(0,0,0,0.1);
        --swipe-bg-punch-in: #4CAF50;
        --swipe-bg-punch-out: #F44336;
        --swipe-text-color: #FFFFFF;
    }
    body { background-color: #F5F5F5; font-family: 'Roboto', sans-serif; }
    .md-card { background-color: var(--app-card-background-color); border-radius: var(--app-border-radius); box-shadow: var(--app-card-shadow); margin-bottom: 1rem; overflow: hidden; }
    .md-card-header { padding: 12px 16px; border-bottom: 1px solid #eee; background-color: #f9f9f9; }
    .md-card-title { font-size: 1.1rem; font-weight: 500; color: var(--app-text-color-primary); margin-bottom: 0; }
    .md-card-content { padding: 16px; }
    .md-card-content.no-padding { padding: 0; }

    .attendance-status-card .md-card-content { padding-top: 24px; padding-bottom: 24px; }
    .status-header { font-size: 0.9rem; color: var(--app-text-color-secondary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-time-info { font-size: 1.1rem; font-weight: 500; color: var(--app-text-color-primary); margin-bottom: 2px; }
    .status-time-value { font-size: 1.5rem; font-weight: 700; color: var(--app-primary-color); margin-bottom: 16px; }
    .timer-live { font-size: 1.5rem; font-weight: 700; color: var(--app-primary-color); margin-bottom: 4px; }
    .timer-live-label { font-size: 0.8rem; color: var(--app-text-color-secondary); margin-bottom: 16px; }

    .swipe-container { width: 100%; max-width: 400px; margin: 0 auto; background-color: var(--swipe-bg-punch-in); border-radius: 50px; padding: 8px; position: relative; overflow: hidden; cursor: grab; user-select: none; height: 60px; display: flex; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
    .swipe-container.punch-out { background-color: var(--swipe-bg-punch-out); }
    .swipe-handle { width: 44px; height: 44px; background-color: white; border-radius: 50%; position: absolute; left: 8px; top: 8px; display: flex; align-items: center; justify-content: center; z-index: 2; transition: left 0.1s ease-out; }
    .swipe-handle .material-icons { color: var(--swipe-bg-punch-in); font-size: 24px; }
    .swipe-container.punch-out .swipe-handle .material-icons { color: var(--swipe-bg-punch-out); }
    .swipe-text { position: absolute; left: 0; right: 0; text-align: center; color: var(--swipe-text-color); font-weight: 500; font-size: 0.9rem; z-index: 1; padding-left: 60px; padding-right: 20px; letter-spacing: 0.5px; }

    /* Monthly Log - Single Row Table Style */
    .monthly-log-list { padding: 0; margin: 0; list-style-type: none; }
    .log-entry {
        display: flex;
        align-items: center; /* Vertically center date col with details row */
        padding: 10px 12px;
        border-bottom: 1px solid #efefef;
        background-color: #fff;
    }
    .log-entry:last-child { border-bottom: none; }

    .log-date-col {
        flex: 0 0 70px; /* Fixed width for date column */
        text-align: center;
        padding-right: 10px; /* Space between date and details */
    }
    .log-date-formatted { /* For "DD-Mon" */
        display: block;
        font-size: 0.9rem; 
        font-weight: 500;
        color: var(--app-text-color-primary);
    }
    .log-date-year-formatted { /* For "YYYY" */
        display: block;
        font-size: 0.75rem;
        color: var(--app-text-color-secondary);
    }

    .log-details-container { /* Holds the single row of details and remarks below */
        flex-grow: 1;
        display: flex;
        flex-direction: column; /* Stack details row and remarks row */
    }

    .log-details-main-row { /* The single row for punch-in, punch-out, duration */
        display: flex;
        justify-content: space-between; /* Distribute columns */
        align-items: center; /* Vertically align items within this row */
        width: 100%;
    }
    
    .log-detail-column {
        flex: 1; /* Allow columns to take up space */
        display: flex;
        align-items: center; /* Align dot and text */
        justify-content: flex-start; /* Align content to the start of the column */
        font-size: 0.85rem;
        color: var(--app-text-color-primary);
        padding: 0 4px; /* Minimal padding between columns */
        min-width: 0; /* Important for flex items to shrink properly */
    }
    .log-detail-column:nth-child(1) { justify-content: flex-start; flex-basis: 35%;} /* Punch In */
    .log-detail-column:nth-child(2) { justify-content: center; flex-basis: 35%;} /* Punch Out - center aligned */
    .log-detail-column:nth-child(3) { justify-content: flex-end; text-align: right; flex-basis: 30%;} /* Working hours - right aligned */


    .log-detail-column .indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        flex-shrink: 0; /* Prevent dot from shrinking */
    }
    .indicator.present { background-color: var(--app-success-color); }
    .indicator.checkout { background-color: var(--app-error-color); }
    
    .log-detail-value {
        font-weight: 500;
        white-space: nowrap; /* Prevent time from wrapping */
    }
    .log-detail-value.nil {
        color: var(--app-text-color-secondary);
        font-style: italic;
        font-weight: 400;
    }
    .log-detail-value.absent-status {
        color: var(--app-error-color);
        font-weight: bold;
    }

    .log-remarks-row {
        font-size: 0.75rem;
        color: var(--app-text-color-secondary);
        padding-top: 4px;
        margin-left: 0; /* Align with the start of details container */
        width: 100%;
    }
    .log-remarks-row.absent-reason {
        color: var(--app-error-color);
    }


    .mark-absent-btn-container { margin-top: 20px; text-align: center; }
    .md-btn-outlined { background-color: transparent; color: var(--app-primary-color); border: 1px solid var(--app-primary-color); border-radius: var(--app-border-radius); padding: 8px 16px; font-weight: 500; text-transform: uppercase; transition: background-color 0.3s ease, color 0.3s ease; }
    .md-btn-outlined:hover { background-color: var(--app-primary-color); color: white; }
    .md-btn-outlined .material-icons { margin-right: 8px; font-size: 1.1em; }
    .month-selector-container { padding: 8px 16px; border-bottom: 1px solid #eee; }

    @media (max-width: 420px) {
        .log-date-col { flex: 0 0 60px; padding-right: 6px;}
        .log-date-formatted { font-size: 0.8rem; }
        .log-date-year-formatted { font-size: 0.7rem; }
        .log-detail-column { font-size: 0.75rem; padding: 0 2px;}
        .log-detail-column .indicator { width: 6px; height: 6px; margin-right: 4px;}
        .log-entry { padding: 8px 8px; }
    }
    @media (max-width: 360px) {
        .log-date-col { flex: 0 0 55px; }
        .log-details-main-row { flex-wrap: wrap; } /* Allow columns to wrap on very small screens */
        .log-detail-column { flex-basis: 48% !important; margin-bottom: 3px; } /* Two columns per row when wrapped */
        .log-detail-column:nth-child(3) { flex-basis: 100% !important; justify-content: center; text-align: center; } /* Duration full width */
    }
</style>

<div class="container-fluid mt-0 px-sm-3 px-2 py-3"> 
    <div class="row">
        <div class="col-12">
            <?php include '../includes/alerts.php'; ?>
        </div>
    </div>

    <div class="md-card attendance-status-card mb-4">
        <div class="md-card-content text-center">
            <?php
            $action_type = ''; 
            $swipe_text = '';
            $swipe_bg_class = '';
            $status_display_time = date('h:i A'); 

            if (!$today_attendance || (empty($today_attendance['check_in_time']) && $today_attendance['status'] !== 'absent')) {
                echo '<div class="status-header">Ready to Start</div>';
                echo '<div class="status-time-info">Today, ' . date('D, d M Y') . '</div>';
                echo '<div class="status-time-value">' . $status_display_time . '</div>';
                $action_type = 'check_in';
                $swipe_text = 'Swipe to Punch-In';
            } elseif ($today_attendance && !empty($today_attendance['check_in_time']) && empty($today_attendance['check_out_time'])) {
                echo '<div class="status-header">Punched-In At</div>';
                echo '<div class="status-time-info">' . date('D, d M Y', strtotime($today_attendance['check_in_time'])) . '</div>';
                echo '<div class="status-time-value">' . date('h:i A', strtotime($today_attendance['check_in_time'])) . '</div>';
                echo '<div class="timer-live" id="live-timer" data-check-in-time="' . htmlspecialchars($today_attendance['check_in_time']) . '">00:00:00</div>';
                echo '<div class="timer-live-label mb-3">Current Session Duration</div>';
                $action_type = 'check_out';
                $swipe_text = 'Swipe to Punch-Out';
                $swipe_bg_class = 'punch-out'; 
            } elseif ($today_attendance && !empty($today_attendance['check_out_time'])) {
                echo '<div class="status-header">Attendance Complete</div>';
                echo '<div class="status-time-info">' . date('D, d M Y', strtotime($today_attendance['attendance_date'])) . '</div>';
                $check_in_dt = new DateTime($today_attendance['check_in_time']);
                $check_out_dt = new DateTime($today_attendance['check_out_time']);
                $duration = $check_in_dt->diff($check_out_dt);
                $total_hours = $duration->h + ($duration->days * 24);
                $total_minutes = $duration->i;
                echo '<div class="status-time-value">Total Duration: ' . sprintf('%02d:%02d', $total_hours, $total_minutes) . ' hrs</div>';
            } elseif ($today_attendance && $today_attendance['status'] === 'absent') {
                echo '<div class="status-header" style="color: var(--app-error-color);">Marked as Absent</div>';
                echo '<div class="status-time-info">Today, ' . date('D, d M Y') . '</div>';
                 if (!empty($today_attendance['remarks'])) {
                    echo '<p class="text-muted mt-1 mb-0 small">Reason: ' . htmlspecialchars($today_attendance['remarks']) . '</p>';
                }
                $action_type = 'check_in';
                $swipe_text = 'Swipe to Punch-In';
                 echo '<div class="status-time-value mt-2" style="font-size:1rem;">You can still punch-in to override.</div>';
            }
            ?>

            <?php if ($action_type): ?>
                <div id="swipeButtonContainer" class="swipe-container <?php echo $swipe_bg_class; ?>" data-action="<?php echo $action_type; ?>">
                    <div class="swipe-handle"><span class="material-icons">arrow_forward</span></div>
                    <div class="swipe-text"><?php echo $swipe_text; ?></div>
                </div>
                <form id="checkInForm" method="post" style="display: none;"><input type="hidden" name="action" value="check_in"></form>
                <form id="checkOutForm" method="post" style="display: none;"><input type="hidden" name="action" value="check_out"></form>
            <?php endif; ?>

            <?php if (!$today_attendance || ($today_attendance['status'] !== 'absent' && empty($today_attendance['check_in_time'])) || ($today_attendance['status'] === 'absent' && empty($today_attendance['check_in_time'])) ): ?>
            <div class="mark-absent-btn-container mt-3">
                <button type="button" class="md-btn-outlined" data-bs-toggle="modal" data-bs-target="#markAbsentModal">
                    <span class="material-icons">person_off</span> Mark as Absent
                </button>
            </div>
            <?php endif; ?>
        </div>
    </div>

    <div class="md-card mb-3">
        <div class="md-card-header d-flex justify-content-between align-items-center">
            <h5 class="md-card-title mb-0">Monthly Log</h5>
        </div>
        <div class="month-selector-container">
             <select class="form-select form-select-sm" id="monthSelector" onchange="window.location.href='attendance.php?month='+this.value">
                <?php foreach ($available_months as $month_value => $month_name): ?>
                    <option value="<?php echo htmlspecialchars($month_value); ?>" <?php echo ($month_value === $selected_month) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($month_name); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="md-card-content no-padding">
            <?php if (empty($month_attendance)): ?>
                <div class="text-center py-4 px-3 text-muted">No attendance records found for this month.</div>
            <?php else: ?>
                <ul class="monthly-log-list">
                    <?php foreach ($month_attendance as $record): ?>
                        <li class="log-entry">
                            <div class="log-date-col">
                                <span class="log-date-formatted"><?php echo date('d-M', strtotime($record['attendance_date'])); ?></span>
                                <span class="log-date-year-formatted"><?php echo date('Y', strtotime($record['attendance_date'])); ?></span>
                            </div>
                            <div class="log-details-container">
                                <div class="log-details-main-row">
                                    <div class="log-detail-column">
                                        <span class="indicator present"></span>
                                        <span class="log-detail-value <?php echo empty($record['check_in_time']) ? 'nil' : ''; ?>">
                                            <?php echo !empty($record['check_in_time']) ? date('h:i A', strtotime($record['check_in_time'])) : 'Nil'; ?>
                                        </span>
                                    </div>
                                    <div class="log-detail-column">
                                        <span class="indicator checkout"></span>
                                        <span class="log-detail-value <?php echo empty($record['check_out_time']) ? 'nil' : ''; ?>">
                                            <?php echo !empty($record['check_out_time']) ? date('h:i A', strtotime($record['check_out_time'])) : 'Nil'; ?>
                                        </span>
                                    </div>
                                    <div class="log-detail-column">
                                        <span class="log-detail-value <?php echo (empty($record['check_in_time']) || empty($record['check_out_time'])) && $record['status'] !== 'absent' ? 'nil' : ''; ?> <?php if($record['status'] === 'absent') echo 'absent-status'; ?>">
                                            <?php 
                                            if ($record['status'] === 'absent') {
                                                echo 'Absent';
                                            } elseif (!empty($record['check_in_time']) && !empty($record['check_out_time'])) {
                                                $rec_check_in_dt = new DateTime($record['check_in_time']);
                                                $rec_check_out_dt = new DateTime($record['check_out_time']);
                                                $rec_duration_interval = $rec_check_in_dt->diff($rec_check_out_dt);
                                                $rec_hours_val = $rec_duration_interval->h + ($rec_duration_interval->days * 24);
                                                $rec_minutes_val = $rec_duration_interval->i;
                                                echo sprintf('%02d:%02d', $rec_hours_val, $rec_minutes_val);
                                            } else {
                                                echo 'Nil';
                                            }
                                            ?>
                                        </span>
                                    </div>
                                </div>
                                <?php if (!empty($record['remarks'])): ?>
                                    <div class="log-remarks-row <?php if($record['status'] === 'absent') echo 'absent-reason'; ?>">
                                        <?php echo ($record['status'] === 'absent' ? 'Reason: ' : 'Notes: ') . htmlspecialchars($record['remarks']); ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </li>
                    <?php endforeach; ?>
                </ul>
            <?php endif; ?>
        </div>
    </div>
</div>

<div class="modal fade" id="markAbsentModal" tabindex="-1" aria-labelledby="markAbsentModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="markAbsentModalLabel">Mark as Absent</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="post">
                <input type="hidden" name="action" value="mark_absent">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="absentReason" class="form-label">Reason for Absence (Required)</label>
                        <textarea class="form-control" id="absentReason" name="reason" rows="3" required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-danger">Mark as Absent</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const liveTimerElement = document.getElementById('live-timer');
    if (liveTimerElement) {
        const checkInTimeAttr = liveTimerElement.getAttribute('data-check-in-time');
        if (checkInTimeAttr) {
            const checkInTimestamp = new Date(checkInTimeAttr).getTime();
            function updateLiveTimer() {
                const now = new Date().getTime();
                let timeDiff = now - checkInTimestamp;
                if (timeDiff < 0) timeDiff = 0; 
                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                liveTimerElement.textContent = 
                    hours.toString().padStart(2, '0') + ':' +
                    minutes.toString().padStart(2, '0') + ':' +
                    seconds.toString().padStart(2, '0');
            }
            updateLiveTimer(); 
            setInterval(updateLiveTimer, 1000); 
        }
    }

    const swipeButtonContainer = document.getElementById('swipeButtonContainer');
    if (swipeButtonContainer) {
        const swipeHandle = swipeButtonContainer.querySelector('.swipe-handle');
        const action = swipeButtonContainer.getAttribute('data-action');
        let isDragging = false, startX, currentX, offsetX;
        const threshold = swipeButtonContainer.offsetWidth * 0.7; 
        const maxSwipe = swipeButtonContainer.offsetWidth - swipeHandle.offsetWidth - 16; 

        function startDrag(e) {
            isDragging = true;
            startX = e.pageX || e.touches[0].pageX;
            swipeHandle.style.transition = 'none'; 
            offsetX = swipeHandle.offsetLeft; 
        }
        function drag(e) {
            if (!isDragging) return;
            currentX = e.pageX || e.touches[0].pageX;
            let diffX = currentX - startX;
            let newLeft = offsetX + diffX;
            if (newLeft < 0) newLeft = 0; 
            if (newLeft > maxSwipe) newLeft = maxSwipe;
            swipeHandle.style.left = newLeft + 'px';
        }
        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            swipeHandle.style.transition = 'left 0.2s ease-out'; 
            if (swipeHandle.offsetLeft >= threshold) {
                if (action === 'check_in') document.getElementById('checkInForm').submit();
                else if (action === 'check_out') document.getElementById('checkOutForm').submit();
            } else {
                swipeHandle.style.left = '8px'; 
            }
        }
        swipeHandle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        swipeHandle.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('touchmove', drag, { passive: true });
        document.addEventListener('touchend', endDrag);
    }
});
</script>

<?php include '../includes/rider_footer.php'; ?>
