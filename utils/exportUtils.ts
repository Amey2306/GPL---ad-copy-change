import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { AdCopy } from '../types';

/**
 * Creates and downloads an Excel file containing Google and Meta ad copy.
 * @param googleAds - The array of Google ad copy.
 * @param metaAds - The array of Meta ad copy.
 * @param projectName - The name of the project for the filename.
 */
export const exportAdCopyToExcel = async (
    googleAds: AdCopy[],
    metaAds: AdCopy[],
    projectName: string
): Promise<void> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Godrej AdGen';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Google Ads Sheet
    const googleSheet = workbook.addWorksheet('Google');
    googleSheet.columns = [
        { header: 'Field', key: 'field', width: 25 },
        { header: 'Text', key: 'text', width: 100 },
    ];
    googleSheet.addRows(googleAds);

    // Meta Ads Sheet
    const metaSheet = workbook.addWorksheet('Meta');
    metaSheet.columns = [
        { header: 'Field', key: 'field', width: 25 },
        { header: 'Text', key: 'text', width: 100 },
    ];
    metaSheet.addRows(metaAds);
    
    // Style headers for both sheets
    [googleSheet, metaSheet].forEach(sheet => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Inter' };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0284C7' } // Sky-600 color
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
        sheet.views = [{state: 'frozen', ySplit: 1}];
    });


    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sanitizedProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${sanitizedProjectName}_ad_copy_${date}.xlsx`;
    
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
};
