/**
 * Lightweight utility to export JSON data to CSV
 */
export const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV rows
    const csvRows = [
        headers.join(','), // header row
        ...data.map(row => 
            headers.map(header => {
                const val = row[header];
                // Handle nested objects (like staff.name)
                if (typeof val === 'object' && val !== null) {
                    return `"${Object.values(val).join(' ')}"`;
                }
                // Handle comma in text
                return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(',')
        )
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
