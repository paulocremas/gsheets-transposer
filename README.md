# Google Sheets Data Transposition with Apps Script

This script was developed at the request of a BI analyst who needed a custom data structure. It automatically transposes data between sheets, marking processed rows with a checked column to prevent duplicates.

### Features

- Transposes data from a source sheet to a target sheet
- Marks processed rows with `TRUE` in a `checked` column
- Prevents duplicate processing of the same data
- Simple configuration with sheet names and column mapping

## How It Works

### Script Overview

The script performs the following operations:

1. Identifies unprocessed rows in the source sheet (where `checked` column is empty or `FALSE`)
2. Transposes the selected data to the target sheet
3. Marks the processed rows as `TRUE` in the `checked` column
4. Handles data formatting and alignment

### Original
| A |  B |
|----------|----------|
|   10    |    20    |
|   30    |    40    |
|    50    |    60    |

### Outcome
| |  ||
|----------|----------|----------|
|    10    |    30    |    50    |
|    20    |    40    |    60    |
