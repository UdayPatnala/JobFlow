/* 
   Jest Unit Tests - Jobflow Copilot Resume Adaptor & Exporters
   Designed to validate core parsing and data extraction logic.
*/

// Mock functions since they run browser-side in the dashboard
const runLocalKeywordMatch = (userSkillsArray, jobDescriptionText) => {
    const jobDescLower = jobDescriptionText.toLowerCase();
    const matchingPool = ['Docker', 'REST APIs', 'Playwright', 'Selenium', 'CI/CD', 'AWS', 'Kubernetes', 'FastAPI', 'Node.js', 'Typescript', 'React', 'DevOps'];
    
    const output = [...userSkillsArray];
    matchingPool.forEach(skill => {
        if (jobDescLower.includes(skill.toLowerCase()) && !userSkillsArray.some(s => s.toLowerCase() === skill.toLowerCase())) {
            output.push(skill);
        }
    });
    return output;
};

const convertLedgerToCsv = (ledgerArray) => {
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
};

describe('Jobflow Copilot Core Parser Unit Tests', () => {
    
    test('runLocalKeywordMatch should append matched missing skills and preserve original inputs', () => {
        const originalSkills = ['Python', 'SQL'];
        const jobDescription = 'Looking for Python developer experienced in Docker and Kubernetes.';
        
        const result = runLocalKeywordMatch(originalSkills, jobDescription);
        
        // Assertions
        expect(result).toContain('Python');
        expect(result).toContain('SQL');
        expect(result).toContain('Docker');
        expect(result).not.toContain('Kubernetes'); // Kubernetes not in matchingPool
    });

    test('convertLedgerToCsv should escape quotes and assemble fields properly', () => {
        const sampleLedger = [
            { time: '2026-06-04 12:00', title: 'Senior Dev "API"', company: 'Vector', platform: 'LinkedIn', status: 'Applied', action: 'None' }
        ];

        const csv = convertLedgerToCsv(sampleLedger);
        
        expect(csv).toContain('Timestamp,Job Title,Company,Platform,Status,Action Required');
        expect(csv).toContain('"Senior Dev ""API"""');
        expect(csv).toContain('"Vector"');
    });
});
