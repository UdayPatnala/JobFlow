/* 
   Jobflow Copilot V2.0 - Application Controller Logic
   Designed for Entry-Level Portfolio (Fresher Showcase)
   
   This script handles:
   1. Tab navigation control & SVG node flowchart contextual highlights.
   2. Resume Adaptor with fallback local token matching OR live Gemini LLM integration.
   3. Collapsible UI widgets for settings.
   4. Application tracking ledger backed by LocalStorage.
   5. Dynamic SVG-based Analytics charts (Donut & Frequency Bars).
   6. Data exports (CSV for logs, TXT for resume outputs).
   7. Real-time ledger search and filter utilities.
*/

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
                // Correct public endpoints for standard client-side JSON request
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
            const jobDescLower = jobDescText.toLowerCase();
            const matchingPool = ['Docker', 'REST APIs', 'Playwright', 'Selenium', 'CI/CD', 'AWS', 'Kubernetes', 'FastAPI', 'Node.js', 'Typescript', 'React', 'DevOps'];
            
            // Keep original skills
            adaptedSkillsArray = [...rawSkills];
            
            // Inject potential skills if present in job description
            matchingPool.forEach(skill => {
                if (jobDescLower.includes(skill.toLowerCase()) && !rawSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
                    adaptedSkillsArray.push(skill);
                }
            });
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
        
        // Reset inputs and re-render
        renderLedger(trackerSearch.value, trackerFilterStatus.value);
        triggerMockWindowsToast(title, company, reasonText);
    });

    btnClearTracker.addEventListener('click', () => {
        localStorage.setItem('jobflow_ledger', JSON.stringify(defaultLedger));
        renderLedger(trackerSearch.value, trackerFilterStatus.value);
    });

    // CSV Exporter implementation logic
    btnExportCsv.addEventListener('click', () => {
        const ledger = getLedger();
        let csvContent = "Timestamp,Job Title,Company,Platform,Status,Action Required\n";
        
        ledger.forEach(row => {
            // Escape values for safe CSV export
            const time = `"${row.time}"`;
            const title = `"${row.title.replace(/"/g, '""')}"`;
            const company = `"${row.company.replace(/"/g, '""')}"`;
            const platform = `"${row.platform}"`;
            const status = `"${row.status}"`;
            const action = `"${row.action.replace(/"/g, '""')}"`;
            
            csvContent += `${time},${title},${company},${platform},${status},${action}\n`;
        });

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
            console.log("Audio contexts not initialised");
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

    function generateScriptSnippets() {
        // Prepare variables for display
        const python = cfgPythonPath.value.trim();
        const script = cfgScriptPath.value.trim();
        const profile = cfgBrowserProfile.value.trim();

        const psCode = `$Action = New-ScheduledTaskAction -Execute "${python}" -Argument "\`"${script}\`""
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "JobflowCopilotScheduler" -Action $Action -Trigger $Trigger -Settings $Settings -Description "Runs Jobflow Copilot on User Windows Startup" -Force`;

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

    // Initialize Page Logs & Charts
    renderLedger();
    generateScriptSnippets();
});
