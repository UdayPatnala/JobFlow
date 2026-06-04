/* Application Logic: Jobflow Copilot Conceptual Dashboard */

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Configurations
    const tabHeaders = {
        'tab-dashboard': { title: 'System Overview', desc: 'High-level architectural components and integration telemetry.' },
        'tab-adaptor': { title: 'Resume Skill Adaptor', desc: 'Simulating formatting-safe keyword adaptation for target job descriptions.' },
        'tab-tracker': { title: 'Application Ledger & Alerts', desc: 'Tracking active applications and testing manual-input triggers.' },
        'tab-scheduler': { title: 'Windows Scheduler Config', desc: 'Configure automatic script startup settings and code generation.' },
        'tab-education': { title: 'Compliance & Safety Center', desc: 'Detailed assessments of terms of service risks and anti-bot measures.' }
    };

    // DOM Element References
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const currentTabTitle = document.getElementById('current-tab-title');
    const currentTabDesc = document.getElementById('current-tab-desc');

    // Sidebar Tab Switching
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Switch navigation highlights
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Switch visible panel
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                }
            });

            // Update Header Info
            if (tabHeaders[targetTab]) {
                currentTabTitle.textContent = tabHeaders[targetTab].title;
                currentTabDesc.textContent = tabHeaders[targetTab].desc;
            }

            // Highlight flowchart node depending on selected tab
            updateFlowchartNodeHighlight(targetTab);
        });
    });

    function updateFlowchartNodeHighlight(activeTab) {
        // Clear highlights
        document.querySelectorAll('.flow-node').forEach(node => {
            node.classList.remove('node-highlight');
        });

        // Add contextual highlights
        if (activeTab === 'tab-adaptor') {
            document.getElementById('node-3')?.classList.add('node-highlight');
        } else if (activeTab === 'tab-tracker') {
            document.getElementById('node-5')?.classList.add('node-highlight');
        } else if (activeTab === 'tab-scheduler') {
            document.getElementById('node-1')?.classList.add('node-highlight');
        } else {
            // Default: highlight adaptor step on overview page
            document.getElementById('node-3')?.classList.add('node-highlight');
        }
    }

    /* ----------------------------------------------------
       RESUME ADAPTOR SUB-SYSTEM
       ---------------------------------------------------- */
    const btnAdaptSkills = document.getElementById('btn-adapt-skills');
    const inputSkills = document.getElementById('input-skills');
    const inputJobDesc = document.getElementById('input-job-desc');
    const resumeSkillsBlock = document.getElementById('resume-skills-block');
    const btnCopySkills = document.getElementById('btn-copy-skills');
    const adaptorToast = document.getElementById('adaptor-toast');
    const statsAdaptations = document.getElementById('stats-adaptations');

    let totalAdaptations = parseInt(localStorage.getItem('jobflow_adaptations') || '0', 10);
    statsAdaptations.textContent = totalAdaptations;

    btnAdaptSkills.addEventListener('click', () => {
        const rawSkills = inputSkills.value.split(',').map(s => s.trim()).filter(Boolean);
        const jobDescText = inputJobDesc.value.toLowerCase();
        
        if (rawSkills.length === 0) {
            alert('Please supply at least one core skill.');
            return;
        }

        // Simulating matching and identifying missing skills
        const potentialExtraSkills = ['Docker', 'REST APIs', 'Playwright', 'Selenium', 'CI/CD', 'AWS', 'Kubernetes', 'FastAPI'];
        const matches = [];
        const injected = [];

        // Check which original skills match the job description
        rawSkills.forEach(skill => {
            if (jobDescText.includes(skill.toLowerCase())) {
                matches.push(skill);
            } else {
                matches.push(skill); // keep original
            }
        });

        // Scan potential skills and inject matching ones to simulate LLM context alignment
        potentialExtraSkills.forEach(extra => {
            if (jobDescText.includes(extra.toLowerCase()) && !rawSkills.some(rs => rs.toLowerCase() === extra.toLowerCase())) {
                injected.push(extra);
            }
        });

        // Format skills block with visual diff tags (only for simulated preview)
        let previewHtml = 'Skills: ';
        const allSkillsCombined = [...matches];
        
        previewHtml += allSkillsCombined.join(', ');
        if (injected.length > 0) {
            previewHtml += ', ' + injected.map(s => `<span class="skills-diff-added">${s}</span>`).join(', ');
        }

        // Apply HTML preview simulation
        resumeSkillsBlock.innerHTML = previewHtml;
        btnCopySkills.disabled = false;
        
        // Increment Counter
        totalAdaptations++;
        localStorage.setItem('jobflow_adaptations', totalAdaptations);
        statsAdaptations.textContent = totalAdaptations;

        // Feedback
        showNotificationToast('Skills adapted successfully. Format preserved.', 'success');
    });

    btnCopySkills.addEventListener('click', () => {
        // Strip HTML tags for clean text copy
        const textToCopy = resumeSkillsBlock.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            adaptorToast.textContent = 'Skills Copied to Clipboard!';
            setTimeout(() => { adaptorToast.textContent = ''; }, 3000);
        });
    });

    /* ----------------------------------------------------
       APPLICATION TRACKER SUB-SYSTEM
       ---------------------------------------------------- */
    const btnTriggerAlert = document.getElementById('btn-trigger-alert');
    const jobTitleSim = document.getElementById('job-title-sim');
    const companySim = document.getElementById('company-sim');
    const statusReasonSim = document.getElementById('status-reason-sim');
    const trackerTableBody = document.getElementById('tracker-table-body');
    const btnClearTracker = document.getElementById('btn-clear-tracker');
    const statsRecords = document.getElementById('stats-records');
    const notificationPortal = document.getElementById('notification-portal');

    // Default Starter Ledger
    const defaultLedger = [
        { time: '2026-06-04 09:30', title: 'Python Automation Engineer', company: 'NextStep Inc', platform: 'LinkedIn', status: 'Applied', action: 'None' },
        { time: '2026-06-04 10:05', title: 'Data Pipeline Specialist', company: 'Vector AI', platform: 'Naukri', status: 'Applied', action: 'None' },
        { time: '2026-06-04 10:45', title: 'Backend Dev (Django/FastAPI)', company: 'ScaleUp Ventures', platform: 'LinkedIn', status: 'Flagged', action: 'Manual CV upload failed' },
        { time: '2026-06-04 11:20', title: 'Full Stack Engineer', company: 'CloudBase Corp', platform: 'Naukri', status: 'Applied', action: 'None' }
    ];

    function getLedger() {
        const stored = localStorage.getItem('jobflow_ledger');
        if (!stored) {
            localStorage.setItem('jobflow_ledger', JSON.stringify(defaultLedger));
            return defaultLedger;
        }
        return JSON.parse(stored);
    }

    function renderLedger() {
        const ledger = getLedger();
        trackerTableBody.innerHTML = '';
        statsRecords.textContent = ledger.length;

        ledger.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'badge-green';
            if (item.status === 'Flagged') badgeClass = 'badge-red';
            if (item.status === 'Manual Check') badgeClass = 'badge-orange';

            tr.innerHTML = `
                <td>${item.time}</td>
                <td><strong>${item.title}</strong></td>
                <td>${item.company}</td>
                <td>${item.platform}</td>
                <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
                <td class="text-secondary">${item.action}</td>
            `;
            trackerTableBody.appendChild(tr);
        });
    }

    btnTriggerAlert.addEventListener('click', () => {
        const title = jobTitleSim.value.trim() || 'Software Engineer';
        const company = companySim.value.trim() || 'SaaS startup';
        const reasonSelect = statusReasonSim.value;
        
        let reasonText = 'Manual application check required';
        if (reasonSelect === 'needs_manual') reasonText = 'Requires custom portfolio link input';
        if (reasonSelect === 'tos_guardrail') reasonText = 'Anti-bot cooldown active - Complete manually';
        if (reasonSelect === 'skills_mismatch') reasonText = 'Major skill gap detected (Docker missing)';

        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Insert new record into ledger
        const ledger = getLedger();
        ledger.unshift({
            time: timeStr,
            title: title,
            company: company,
            platform: 'LinkedIn (Simulated)',
            status: 'Manual Check',
            action: reasonText
        });
        localStorage.setItem('jobflow_ledger', JSON.stringify(ledger));
        renderLedger();

        // Spawn mock Windows Toast Notification
        triggerMockWindowsToast(title, company, reasonText);
    });

    btnClearTracker.addEventListener('click', () => {
        localStorage.setItem('jobflow_ledger', JSON.stringify(defaultLedger));
        renderLedger();
    });

    function triggerMockWindowsToast(title, company, msg) {
        const toast = document.createElement('div');
        toast.className = 'windows-toast';
        toast.innerHTML = `
            <div class="windows-toast-header">
                <span class="windows-toast-title">⚠️ Action Required</span>
                <span class="windows-toast-close">&times;</span>
            </div>
            <div class="windows-toast-body">
                <h5>${company}</h5>
                <p><strong>Job:</strong> ${title}</p>
                <p style="color:var(--accent-rose); font-weight:500; margin-top:0.2rem;">${msg}</p>
            </div>
        `;

        notificationPortal.appendChild(toast);

        // Toast audio visualizer mockup chime
        playMockNotificationSound();

        // Close toast on click
        toast.querySelector('.windows-toast-close').addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        });

        // Auto close after 8 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 8000);
    }

    function playMockNotificationSound() {
        // Safe, simulated audio chime using standard web audio API
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            // Retro/Windows-like clean notification double chime
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
            
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) {
            console.log("Audio not supported or interaction deferred");
        }
    }

    function showNotificationToast(message, type = 'info') {
        // Simple console helper log / UI notification feedback handler
        console.log(`[Jobflow Toast] [${type}] ${message}`);
    }

    /* ----------------------------------------------------
       WINDOWS STARTUP & SCRIPT CONFIG
       ---------------------------------------------------- */
    const cfgPythonPath = document.getElementById('cfg-python-path');
    const cfgScriptPath = document.getElementById('cfg-script-path');
    const cfgBrowserProfile = document.getElementById('cfg-browser-profile');

    const codePowershell = document.getElementById('code-powershell');
    const codePython = document.getElementById('code-python');

    const btnSubPowershell = document.getElementById('btn-sub-powershell');
    const btnSubPython = document.getElementById('btn-sub-python');
    const subTabPanels = document.querySelectorAll('.sub-tab-panel');
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');

    // Sub-tabs handling inside Setup
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPanel = btn.getAttribute('data-subtab');
            subTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            subTabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetPanel) {
                    panel.classList.add('active');
                }
            });
        });
    });

    function generateScriptSnippets() {
        const python = cfgPythonPath.value.trim().replace(/\\/g, '\\\\');
        const script = cfgScriptPath.value.trim().replace(/\\/g, '\\\\');
        const profile = cfgBrowserProfile.value.trim().replace(/\\/g, '\\\\');

        // PowerShell XML/CLI Generation
        const psCode = `$Action = New-ScheduledTaskAction -Execute "${cfgPythonPath.value}" -Argument "\`"${cfgScriptPath.value}\`""
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "JobflowCopilotScheduler" -Action $Action -Trigger $Trigger -Settings $Settings -Description "Runs Jobflow Copilot on User Windows Startup" -Force`;

        // Python Selenium snippet
        const pyCode = `import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def init_safe_browser():
    chrome_options = Options()
    # Point browser to user profile to reuse login session tokens (bypass MFA)
    chrome_options.add_argument(f"user-data-dir=${cfgBrowserProfile.value}")
    
    # Standard security bypass options
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(options=chrome_options)
    
    # Hide automation webdriver flag
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    })
    return driver

def load_job_page(driver, url):
    driver.get(url)
    # Human-like interaction pauses
    time.sleep(random.uniform(5.5, 12.0))
    # Scroll dynamically
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight / 3);")`;

        codePowershell.textContent = psCode;
        codePython.textContent = pyCode;
    }

    // Bind event listeners to generate configs dynamically
    [cfgPythonPath, cfgScriptPath, cfgBrowserProfile].forEach(el => {
        el.addEventListener('input', generateScriptSnippets);
    });

    // Copy to clipboard handlers for scripts
    document.getElementById('btn-copy-powershell').addEventListener('click', () => {
        navigator.clipboard.writeText(codePowershell.textContent).then(() => {
            const btn = document.getElementById('btn-copy-powershell');
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy PowerShell Script'; }, 2000);
        });
    });

    document.getElementById('btn-copy-python').addEventListener('click', () => {
        navigator.clipboard.writeText(codePython.textContent).then(() => {
            const btn = document.getElementById('btn-copy-python');
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy Python Base'; }, 2000);
        });
    });

    // Initialize Page
    renderLedger();
    generateScriptSnippets();
});
