import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ReusableTable = ({ data, columns, onEdit, onDelete }) => {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        No data found.
      </Typography>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minWidth: '77vw'
    }}>
      <TableContainer 
        component={Paper}
        sx={{
          width: '100%',
          display: 'table',
          overflowX: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: 'none'
        }}
      >
        <Table sx={{ 
          minWidth: '100%',
          tableLayout: 'auto',
          borderCollapse: 'separate',
          borderSpacing: 0
        }} aria-label="user table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.field}
                  sx={{
                    minWidth: column.minWidth || 'auto',
                    width: column.width || 'auto',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #e0e0e0',
                    borderRight: '1px solid #e0e0e0',
                    '&:last-child': {
                      borderRight: 'none'
                    }
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              <TableCell 
                sx={{ 
                  width: '120px',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #e0e0e0'
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={row.id}
                sx={{ 
                  '&:last-child td': { borderBottom: 0 },
                  '&:hover': { backgroundColor: '#fafafa' }
                }}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={`${row.id}-${column.field}`}
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      borderBottom: '1px solid #e0e0e0',
                      borderRight: '1px solid #e0e0e0',
                      '&:last-child': {
                        borderRight: 'none'
                      }
                    }}
                  >
                    {row[column.field]}
                  </TableCell>
                ))}
                <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={() => onEdit(row)}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => onDelete(row)}
                      sx={{ 
                        color: 'error.main',
                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReusableTable;