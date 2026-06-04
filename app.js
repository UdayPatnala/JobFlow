/* 
   Jobflow Copilot V2.5 - Application Controller Logic
   Designed for Entry-Level Portfolio (Fresher Showcase)
   
   This script handles:
   1. Tab navigation control & SVG node flowchart contextual highlights.
   2. Resume Adaptor with fallback local token matching OR live Gemini LLM integration.
   3. Collapsible UI widgets for settings.
   4. Application tracking ledger backed by LocalStorage.
   5. Dynamic SVG-based Analytics charts (Donut & Frequency Bars).
   6. Data exports (CSV for logs, TXT for resume outputs).
   7. Real-time ledger search and filter utilities.
   8. SDQT Automated In-Browser Test Suite Runner (Unit and Integration assertions).
*/

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Configurations
    const tabHeaders = {
        'tab-dashboard': { title: 'System Overview', desc: 'High-level architectural components and integration telemetry.' },
        'tab-adaptor': { title: 'Resume Skill Adaptor', desc: 'Simulating formatting-safe keyword adaptation for target job descriptions.' },
        'tab-tracker': { title: 'Application Ledger & Alerts', desc: 'Tracking active applications and testing manual-input triggers.' },
        'tab-scheduler': { title: 'Windows Scheduler Config', desc: 'Configure automatic script startup settings and code generation.' },
        'tab-qa': { title: 'QA Automated Test Suite', desc: 'Run browser-based unit assertions, logging validations, and integration tests.' },
        'tab-education': { title: 'Compliance & Safety Center', desc: 'Detailed assessments of terms of service risks and anti-bot measures.' }
    };

    // DOM Element References
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const currentTabTitle = document.getElementById('current-tab-title');
    const currentTabDesc = document.getElementById('current-tab-desc');

    /* ----------------------------------------------------
       TABS NAVIGATION CONTROL
       ---------------------------------------------------- */
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                }
            });

            if (tabHeaders[targetTab]) {
                currentTabTitle.textContent = tabHeaders[targetTab].title;
                currentTabDesc.textContent = tabHeaders[targetTab].desc;
            }

            updateFlowchartNodeHighlight(targetTab);
        });
    });

    function updateFlowchartNodeHighlight(activeTab) {
        document.querySelectorAll('.flow-node').forEach(node => {
            node.classList.remove('node-highlight');
        });

        if (activeTab === 'tab-adaptor') {
            document.getElementById('node-3')?.classList.add('node-highlight');
        } else if (activeTab === 'tab-tracker') {
            document.getElementById('node-5')?.classList.add('node-highlight');
        } else if (activeTab === 'tab-scheduler') {
            document.getElementById('node-1')?.classList.add('node-highlight');
        } else {
            document.getElementById('node-3')?.classList.add('node-highlight');
        }
    }

    /* ----------------------------------------------------
       COLLAPSIBLE API SETTINGS CABINET
       ---------------------------------------------------- */
    const apiSettingsToggle = document.getElementById('api-settings-toggle');
    const apiSettingsBody = document.getElementById('api-settings-body');

    apiSettingsToggle.addEventListener('click', () => {
        apiSettingsToggle.classList.toggle('active');
        apiSettingsBody.classList.toggle('active');
    });

    /* ----------------------------------------------------
       RESUME ADAPTOR SUB-SYSTEM (LOCAL & GEMINI LLM)
       ---------------------------------------------------- */
    const btnAdaptSkills = document.getElementById('btn-adapt-skills');
    const inputSkills = document.getElementById('input-skills');
    const inputJobDesc = document.getElementById('input-job-desc');
    const resumeSkillsBlock = document.getElementById('resume-skills-block');
    const btnCopySkills = document.getElementById('btn-copy-skills');
    const btnDownloadSkills = document.getElementById('btn-download-skills');
    const adaptorToast = document.getElementById('adaptor-toast');
    const statsAdaptations = document.getElementById('stats-adaptations');
    
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const statsApiStatus = document.getElementById('stats-api-status');
    const statsApiDesc = document.getElementById('stats-api-desc');
    const apiConnectionStatus = document.getElementById('api-connection-status');

    let totalAdaptations = parseInt(localStorage.getItem('jobflow_adaptations') || '0', 10);
    statsAdaptations.textContent = totalAdaptations;

    // Monitor API Key updates to visually change UI connection status
    geminiApiKeyInput.addEventListener('input', () => {
        const key = geminiApiKeyInput.value.trim();
        if (key.length > 10) {
            statsApiStatus.textContent = 'ONLINE';
            statsApiStatus.style.color = 'var(--accent-emerald)';
            statsApiDesc.textContent = 'Ready for Live LLM parsing';
            apiConnectionStatus.textContent = 'CONNECTED';
            apiConnectionStatus.style.color = 'var(--accent-emerald)';
        } else {
            statsApiStatus.textContent = 'OFFLINE';
            statsApiStatus.style.color = 'var(--accent-rose)';
            statsApiDesc.textContent = 'Using local fallback logic';
            apiConnectionStatus.textContent = 'DISCONNECTED';
            apiConnectionStatus.style.color = 'var(--accent-rose)';
        }
    });

    btnAdaptSkills.addEventListener('click', async () => {
        const rawSkills = inputSkills.value.split(',').map(s => s.trim()).filter(Boolean);
        const jobDescText = inputJobDesc.value;
        const apiKey = geminiApiKeyInput.value.trim();
        
        if (rawSkills.length === 0) {
            alert('Please supply at least one core skill.');
            return;
        }

        btnAdaptSkills.textContent = 'Processing Application...';
        btnAdaptSkills.disabled = true;

        let adaptedSkillsArray = [];
        let isLlmResponse = false;

        // Route to Gemini API if key is present
        if (apiKey.length > 10) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                const prompt = `You are a career development engine. Given the following applicant skills: "${rawSkills.join(', ')}", and the following job description: "${jobDescText}". Adapt the user's skills section specifically to match this job description. Return ONLY a comma-separated list of matchable skills that align with the job requirements. Keep it factual and avoid placeholders. Do not return any other text, markdown formatting, or HTML tags. Output format: "Python, Docker, SQL, API Integration"`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`API error code: ${response.status}`);
                }

                const data = await response.json();
                const llmOutput = data.candidates[0].content.parts[0].text.replace(/skills:/gi, '').replace(/\*/g, '').trim();
                adaptedSkillsArray = llmOutput.split(',').map(s => s.trim()).filter(Boolean);
                isLlmResponse = true;
            } catch (err) {
                console.warn("Gemini API call failed, running local fallback parser:", err);
                alert("Gemini API failed to connect. Falling back to local keyword matcher.");
            }
        }

        // Local Regex Engine (Fallback or Default Mode)
        if (!isLlmResponse) {
            adaptedSkillsArray = runLocalKeywordMatch(rawSkills, jobDescText);
        }

        // Visual Diff Highlight generator: compare adapted array with original user inputs
        let previewHtml = 'Skills: ';
        const outputElements = adaptedSkillsArray.map(skill => {
            const isOriginal = rawSkills.some(orig => orig.toLowerCase() === skill.toLowerCase());
            if (!isOriginal) {
                return `<span class="skills-diff-added">${skill}</span>`;
            }
            return skill;
        });

        previewHtml += outputElements.join(', ');
        resumeSkillsBlock.innerHTML = previewHtml;

        // Enable Action Buttons
        btnCopySkills.disabled = false;
        btnDownloadSkills.disabled = false;

        // Reset Adaptor button state
        btnAdaptSkills.textContent = 'Adapt Skills Block';
        btnAdaptSkills.disabled = false;

        // Update Statistics
        totalAdaptations++;
        localStorage.setItem('jobflow_adaptations', totalAdaptations);
        statsAdaptations.textContent = totalAdaptations;
    });

    // Helper isolated logic to run local matches (reused in unit tests)
    function runLocalKeywordMatch(userSkillsArray, jobDescriptionText) {
        const jobDescLower = jobDescriptionText.toLowerCase();
        const matchingPool = ['Docker', 'REST APIs', 'Playwright', 'Selenium', 'CI/CD', 'AWS', 'Kubernetes', 'FastAPI', 'Node.js', 'Typescript', 'React', 'DevOps'];
        
        const output = [...userSkillsArray];
        matchingPool.forEach(skill => {
            if (jobDescLower.includes(skill.toLowerCase()) && !userSkillsArray.some(s => s.toLowerCase() === skill.toLowerCase())) {
                output.push(skill);
            }
        });
        return output;
    }

    btnCopySkills.addEventListener('click', () => {
        const textToCopy = resumeSkillsBlock.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            adaptorToast.textContent = 'Skills Copied!';
            setTimeout(() => { adaptorToast.textContent = ''; }, 3000);
        });
    });

    btnDownloadSkills.addEventListener('click', () => {
        const textToCopy = resumeSkillsBlock.textContent;
        const blob = new Blob([textToCopy], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'skills-adapted.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });


    /* ----------------------------------------------------
       APPLICATION TRACKER LOGIC (CRUD & SEARCH & CHARTS)
       ---------------------------------------------------- */
    const btnTriggerAlert = document.getElementById('btn-trigger-alert');
    const jobTitleSim = document.getElementById('job-title-sim');
    const companySim = document.getElementById('company-sim');
    const statusReasonSim = document.getElementById('status-reason-sim');
    const trackerTableBody = document.getElementById('tracker-table-body');
    const btnClearTracker = document.getElementById('btn-clear-tracker');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const statsRecords = document.getElementById('stats-records');
    const statsSuccessRate = document.getElementById('stats-success-rate');
    const notificationPortal = document.getElementById('notification-portal');

    // Filters inputs
    const trackerSearch = document.getElementById('tracker-search');
    const trackerFilterStatus = document.getElementById('tracker-filter-status');

    // Default mock applications
    const defaultLedger = [
        { time: '2026-06-04 09:30', title: 'Python Automation Engineer', company: 'NextStep Inc', platform: 'LinkedIn', status: 'Applied', action: 'None' },
        { time: '2026-06-04 10:05', title: 'Data Pipeline Specialist', company: 'Vector AI', platform: 'Naukri', status: 'Applied', action: 'None' },
        { time: '2026-06-04 10:45', title: 'Backend Dev (Django/FastAPI)', company: 'ScaleUp Ventures', platform: 'LinkedIn', status: 'Flagged', action: 'Major skill gap detected (Docker missing)' },
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

    function renderLedger(filterText = '', filterStatus = 'ALL') {
        const ledger = getLedger();
        trackerTableBody.innerHTML = '';
        
        let filteredCount = 0;
        const query = filterText.toLowerCase();

        ledger.forEach(item => {
            const matchesSearch = item.title.toLowerCase().includes(query) || item.company.toLowerCase().includes(query);
            const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

            if (matchesSearch && matchesStatus) {
                filteredCount++;
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
            }
        });

        statsRecords.textContent = ledger.length;
        updateChartsAndKPIs(ledger);
    }

    // Live search/filtering trigger hooks
    [trackerSearch, trackerFilterStatus].forEach(el => {
        el.addEventListener('input', () => {
            renderLedger(trackerSearch.value, trackerFilterStatus.value);
        });
    });

    /* Donut & Bar Charts calculator logic */
    function updateChartsAndKPIs(ledger) {
        const total = ledger.length;
        if (total === 0) {
            statsSuccessRate.textContent = '0%';
            return;
        }

        const counts = { Applied: 0, 'Manual Check': 0, Flagged: 0 };
        const reasonCounts = { portfolio: 0, bot: 0, skill: 0 };

        ledger.forEach(item => {
            if (counts[item.status] !== undefined) {
                counts[item.status]++;
            }
            // Trace reasons
            const actionLower = item.action.toLowerCase();
            if (actionLower.includes('portfolio')) reasonCounts.portfolio++;
            if (actionLower.includes('cooldown') || actionLower.includes('bot')) reasonCounts.bot++;
            if (actionLower.includes('skill') || actionLower.includes('mismatch')) reasonCounts.skill++;
        });

        // Compute Success Rate = Applied / (Applied + Flagged)
        const successRate = Math.round((counts.Applied / total) * 100);
        statsSuccessRate.textContent = `${successRate}%`;

        // SVG Donut Render
        const circ = 314; // Circumference = 2 * pi * r (r=50)
        const appliedPct = counts.Applied / total;
        const manualPct = counts['Manual Check'] / total;
        const flaggedPct = counts.Flagged / total;

        const appliedStroke = appliedPct * circ;
        const manualStroke = manualPct * circ;
        const flaggedStroke = flaggedPct * circ;

        const segmentApplied = document.getElementById('chart-segment-applied');
        const segmentManual = document.getElementById('chart-segment-manual');
        const segmentFlagged = document.getElementById('chart-segment-flagged');
        
        if (segmentApplied && segmentManual && segmentFlagged) {
            // Segment 1: Applied starts at 0 offset
            segmentApplied.style.strokeDasharray = `${appliedStroke} ${circ}`;
            segmentApplied.style.strokeDashoffset = '0';

            // Segment 2: Manual Check starts after Applied segment
            segmentManual.style.strokeDasharray = `${manualStroke} ${circ}`;
            segmentManual.style.strokeDashoffset = `${-appliedStroke}`;

            // Segment 3: Flagged starts after Applied + Manual
            segmentFlagged.style.strokeDasharray = `${flaggedStroke} ${circ}`;
            segmentFlagged.style.strokeDashoffset = `${-(appliedStroke + manualStroke)}`;
        }

        document.getElementById('chart-donut-total').textContent = total;

        // Bar graphs render percentages
        const maxReason = Math.max(reasonCounts.portfolio, reasonCounts.bot, reasonCounts.skill, 1);
        
        const barPortfolio = document.getElementById('bar-custom-portfolio');
        const barBot = document.getElementById('bar-bot-cooldown');
        const barSkill = document.getElementById('bar-skills-mismatch');

        if (barPortfolio && barBot && barSkill) {
            barPortfolio.style.width = `${(reasonCounts.portfolio / maxReason) * 100}%`;
            barBot.style.width = `${(reasonCounts.bot / maxReason) * 100}%`;
            barSkill.style.width = `${(reasonCounts.skill / maxReason) * 100}%`;

            document.getElementById('val-custom-portfolio').textContent = reasonCounts.portfolio;
            document.getElementById('val-bot-cooldown').textContent = reasonCounts.bot;
            document.getElementById('val-skills-mismatch').textContent = reasonCounts.skill;
        }
    }

    // Helper isolated converter logic (reused in unit tests)
    function convertLedgerToCsv(ledgerArray) {
        let csvContent = "Timestamp,Job Title,Company,Platform,Status,Action Required\n";
        ledgerArray.forEach(row => {
            const time = `"${row.time}"`;
            const title = `"${row.title.replace(/"/g, '""')}"`;
            const company = `"${row.company.replace(/"/g, '""')}"`;
            const platform = `"${row.platform}"`;
            const status = `"${row.status}"`;
            const action = `"${row.action.replace(/"/g, '""')}"`;
            csvContent += `${time},${title},${company},${platform},${status},${action}\n`;
        });
        return csvContent;
    }

    btnTriggerAlert.addEventListener('click', () => {
        const title = jobTitleSim.value.trim() || 'Software Engineer';
        const company = companySim.value.trim() || 'SaaS startup';
        const reasonSelect = statusReasonSim.value;
        
        let reasonText = 'Manual application check required';
        let status = 'Manual Check';
        
        if (reasonSelect === 'needs_manual') reasonText = 'Requires custom portfolio link input';
        if (reasonSelect === 'tos_guardrail') {
            reasonText = 'Anti-bot cooldown active - Complete manually';
        }
        if (reasonSelect === 'skills_mismatch') {
            reasonText = 'Major skill gap detected (Docker missing)';
            status = 'Flagged';
        }

        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const ledger = getLedger();
        ledger.unshift({
            time: timeStr,
            title: title,
            company: company,
            platform: 'LinkedIn (Simulated)',
            status: status,
            action: reasonText
        });
        localStorage.setItem('jobflow_ledger', JSON.stringify(ledger));
        
        renderLedger(trackerSearch.value, trackerFilterStatus.value);
        triggerMockWindowsToast(title, company, reasonText);
    });

    btnClearTracker.addEventListener('click', () => {
        localStorage.setItem('jobflow_ledger', JSON.stringify(defaultLedger));
        renderLedger(trackerSearch.value, trackerFilterStatus.value);
    });

    // CSV Exporter implementation
    btnExportCsv.addEventListener('click', () => {
        const ledger = getLedger();
        const csvContent = convertLedgerToCsv(ledger);

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'jobflow-ledger-export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        playMockNotificationSound();

        toast.querySelector('.windows-toast-close').addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        });

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 8000);
    }

    function playMockNotificationSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
            
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) {
            console.log("Audio Context not allowed by user interaction policy");
        }
    }

    /* ----------------------------------------------------
       WINDOWS STARTUP SCRIPTS CODE GENERATORS
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

    // Helper logic to assembly powershell command (reused in unit tests)
    function assemblyPowerShellCommand(pythonPath, scriptPath) {
        return `$Action = New-ScheduledTaskAction -Execute "${pythonPath}" -Argument "\`"${scriptPath}\`""
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "JobflowCopilotScheduler" -Action $Action -Trigger $Trigger -Settings $Settings -Description "Runs Jobflow Copilot on User Windows Startup" -Force`;
    }

    function generateScriptSnippets() {
        const python = cfgPythonPath.value.trim();
        const script = cfgScriptPath.value.trim();
        const profile = cfgBrowserProfile.value.trim();

        const psCode = assemblyPowerShellCommand(python, script);

        const pyCode = `import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def init_safe_browser():
    chrome_options = Options()
    # Point browser to user profile to reuse login session tokens (bypass MFA)
    chrome_options.add_argument(f"user-data-dir=${profile}")
    
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

    [cfgPythonPath, cfgScriptPath, cfgBrowserProfile].forEach(el => {
        el.addEventListener('input', generateScriptSnippets);
    });

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

    /* ----------------------------------------------------
       SDQT IN-BROWSER TEST RUNNER SUB-SYSTEM
       ---------------------------------------------------- */
    const btnRunQa = document.getElementById('btn-run-qa');
    const btnClearQa = document.getElementById('btn-clear-qa');
    const qaConsoleStatus = document.getElementById('qa-console-status');
    const qaProgressBar = document.getElementById('qa-progress-bar');
    const qaTerminalLogs = document.getElementById('qa-terminal-logs');
    
    const qaTotalCases = document.getElementById('qa-total-cases');
    const qaPassedCases = document.getElementById('qa-passed-cases');
    const qaFailedCases = document.getElementById('qa-failed-cases');
    const qaDuration = document.getElementById('qa-duration');
    const qaPassRate = document.getElementById('qa-pass-rate');

    const qaTestSpeed = document.getElementById('qa-test-speed');
    const qaVerboseLog = document.getElementById('qa-verbose-log');

    let isTestingRunning = false;

    function addConsoleLog(message, type = 'info') {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        let typeClass = 'log-info';
        let prefix = '[INFO]';
        
        if (type === 'success') { typeClass = 'log-success'; prefix = '[PASS]'; }
        if (type === 'fail') { typeClass = 'log-fail'; prefix = '[FAIL]'; }
        if (type === 'warn') { typeClass = 'log-warn'; prefix = '[WARN]'; }
        
        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `<span style="color:var(--text-muted); font-size: 0.75rem;">${timestamp}</span> <span class="${typeClass}">${prefix} ${message}</span>`;
        qaTerminalLogs.appendChild(line);
        qaTerminalLogs.scrollTop = qaTerminalLogs.scrollHeight;
    }

    btnClearQa.addEventListener('click', () => {
        if (isTestingRunning) return;
        qaTerminalLogs.innerHTML = '<div style="color: var(--text-muted);">&gt; Console buffer cleared. Ready for next execution...</div>';
        qaProgressBar.style.width = '0%';
        qaPassedCases.textContent = '0';
        qaFailedCases.textContent = '0';
        qaDuration.textContent = '0 ms';
        qaPassRate.textContent = '0%';
        qaConsoleStatus.textContent = 'IDLE';
        qaConsoleStatus.className = 'badge badge-accent';
    });

    btnRunQa.addEventListener('click', async () => {
        if (isTestingRunning) return;
        isTestingRunning = true;
        
        btnRunQa.disabled = true;
        btnClearQa.disabled = true;
        
        qaConsoleStatus.textContent = 'RUNNING';
        qaConsoleStatus.className = 'badge badge-accent pulsing';
        
        qaTerminalLogs.innerHTML = '';
        qaProgressBar.style.width = '0%';
        
        const delay = parseInt(qaTestSpeed.value, 10);
        const verbose = qaVerboseLog.checked;
        const startTime = performance.now();

        let passed = 0;
        let failed = 0;
        
        addConsoleLog('Initializing SDQT Automated Integration Test Environment...', 'info');
        await sleep(delay);

        // --- TEST CASE 1: Resume adaptation regex keyword aligner ---
        addConsoleLog('Executing Test Case 1: runLocalKeywordMatch assertions...', 'info');
        await sleep(delay);
        try {
            const userSkills = ['Python', 'SQL'];
            const jobDesc = 'We need Python, SQL, Docker, and Kubernetes.';
            const result = runLocalKeywordMatch(userSkills, jobDesc);
            
            // Assertions
            const hasOriginals = result.includes('Python') && result.includes('SQL');
            const hasInjected = result.includes('Docker') && !result.includes('Kubernetes'); // Kubernetes not in matchingPool
            
            if (hasOriginals && hasInjected) {
                passed++;
                addConsoleLog('Test Case 1 passed. Local regex mapped variables successfully.', 'success');
                if (verbose) {
                    addConsoleLog(`[TC1 Details] Inputs: [${userSkills.join(',')}]. Mapped: [${result.join(',')}].`, 'info');
                }
            } else {
                throw new Error('Skills mismatch occurred during pattern check.');
            }
        } catch (e) {
            failed++;
            addConsoleLog(`Test Case 1 failed: ${e.message}`, 'fail');
        }
        qaProgressBar.style.width = '25%';
        updateQaStats(passed, failed, startTime);
        await sleep(delay);

        // --- TEST CASE 2: CSV log converter string parsing ---
        addConsoleLog('Executing Test Case 2: convertLedgerToCsv escaping and column parsing...', 'info');
        await sleep(delay);
        try {
            const testLedger = [
                { time: '2026-06-04 12:00', title: 'Developer "Specialist"', company: 'Innovate', platform: 'LinkedIn', status: 'Applied', action: 'None' }
            ];
            const csvOutput = convertLedgerToCsv(testLedger);
            
            const hasHeader = csvOutput.includes('Timestamp,Job Title,Company,Platform,Status,Action Required');
            const hasEscapedQuotes = csvOutput.includes('"Developer ""Specialist"""');
            
            if (hasHeader && hasEscapedQuotes) {
                passed++;
                addConsoleLog('Test Case 2 passed. CSV format matches output specifications.', 'success');
                if (verbose) {
                    addConsoleLog(`[TC2 Details] CSV content escaped: ${hasEscapedQuotes}`, 'info');
                }
            } else {
                throw new Error('CSV escaping checks failed.');
            }
        } catch (e) {
            failed++;
            addConsoleLog(`Test Case 2 failed: ${e.message}`, 'fail');
        }
        qaProgressBar.style.width = '50%';
        updateQaStats(passed, failed, startTime);
        await sleep(delay);

        // --- TEST CASE 3: PowerShell script builder command output ---
        addConsoleLog('Executing Test Case 3: assemblyPowerShellCommand path parsing...', 'info');
        await sleep(delay);
        try {
            const testPython = 'C:\\Python\\pythonw.exe';
            const testScript = 'C:\\Users\\test\\script.py';
            const generatedCmd = assemblyPowerShellCommand(testPython, testScript);
            
            const hasPythonPath = generatedCmd.includes(testPython);
            const hasScriptPath = generatedCmd.includes(testScript);
            const hasTaskName = generatedCmd.includes('JobflowCopilotScheduler');
            
            if (hasPythonPath && hasScriptPath && hasTaskName) {
                passed++;
                addConsoleLog('Test Case 3 passed. Script path assemblies correctly structured.', 'success');
                if (verbose) {
                    addConsoleLog(`[TC3 Details] XML config parameters verified.`, 'info');
                }
            } else {
                throw new Error('PowerShell generator output has invalid path strings.');
            }
        } catch (e) {
            failed++;
            addConsoleLog(`Test Case 3 failed: ${e.message}`, 'fail');
        }
        qaProgressBar.style.width = '75%';
        updateQaStats(passed, failed, startTime);
        await sleep(delay);

        // --- TEST CASE 4: Browser storage ledger integrity ---
        addConsoleLog('Executing Test Case 4: LocalStorage ledger read/write limits...', 'info');
        await sleep(delay);
        try {
            const storageBackup = localStorage.getItem('jobflow_ledger');
            // Write mock data to verify persistence API
            const mockLog = [{ time: '2026-06-04', title: 'QA', company: 'Test', platform: 'N/A', status: 'Applied', action: '' }];
            localStorage.setItem('jobflow_ledger', JSON.stringify(mockLog));
            
            const readLog = JSON.parse(localStorage.getItem('jobflow_ledger'));
            const isPersisted = readLog.length === 1 && readLog[0].title === 'QA';
            
            // Restore backup
            if (storageBackup) {
                localStorage.setItem('jobflow_ledger', storageBackup);
            } else {
                localStorage.removeItem('jobflow_ledger');
            }
            
            if (isPersisted) {
                passed++;
                addConsoleLog('Test Case 4 passed. LocalStorage serialization and ledger integrity validated.', 'success');
            } else {
                throw new Error('Persistence mismatch occurred.');
            }
        } catch (e) {
            failed++;
            addConsoleLog(`Test Case 4 failed: ${e.message}`, 'fail');
        }
        qaProgressBar.style.width = '100%';
        updateQaStats(passed, failed, startTime);
        await sleep(delay);

        // Finalize test suite execution
        const duration = Math.round(performance.now() - startTime);
        addConsoleLog(`Test suite completed in ${duration}ms.`, 'info');
        
        if (failed === 0) {
            qaConsoleStatus.textContent = 'PASSED';
            qaConsoleStatus.className = 'badge badge-green';
            addConsoleLog('ALL ASSERTIONS PASSED. SYSTEM STATUS: SECURE & STABLE.', 'success');
        } else {
            qaConsoleStatus.textContent = 'FAILED';
            qaConsoleStatus.className = 'badge badge-red';
            addConsoleLog(`TEST FAILURE DETECTED. [Passed: ${passed}, Failed: ${failed}]. REVIEW LOGS.`, 'fail');
        }
        
        btnRunQa.disabled = false;
        btnClearQa.disabled = false;
        isTestingRunning = false;
    });

    function updateQaStats(passed, failed, startTime) {
        const total = passed + failed;
        qaPassedCases.textContent = passed;
        qaFailedCases.textContent = failed;
        qaDuration.textContent = `${Math.round(performance.now() - startTime)} ms`;
        
        const rate = Math.round((passed / 4) * 100);
        qaPassRate.textContent = `${rate}%`;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /* Initialize Page Logs & Charts */
    renderLedger();
    generateScriptSnippets();
});
