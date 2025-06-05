import React from "react";
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
  Box,
  Link,
  Checkbox,
  TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Add type for props
interface UserTableProps {
  data: any[];
  columns: {
    field: string;
    headerName: string;
    width?: number;
    minWidth?: number;
    clickable?: boolean;
    type?: string;
  }[];
  actions: Array<{
    icon: React.ReactElement;
    color: string;
    title: string;
    onClick: (item: any) => void;
  }>;
  loading: boolean;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  totalCount: number;
}

const ReusableTable: React.FC<UserTableProps> = ({
  data,
  columns,
  actions,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  totalCount,
}) => {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        No data found.
      </Typography>
    );
  }

  const handleCellClick = (row: any, column: any) => {
    if (column.clickable && actions.length > 0) {
      actions[0].onClick(row);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // Convert to 1-based index
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        display: "flex",
        flexDirection: "column",
        minWidth: "74vw",
        maxWidth: "100%",
        mx: "auto",
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: "none",
        }}
      >
        <Table
          sx={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
          size="small"
          aria-label="user table"
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
              <TableCell
                sx={{
                  width: "60px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  padding: "6px 12px",
                  borderBottom: "1px solid #e0e0e0",
                  borderRight: "1px solid #e0e0e0",
                }}
              >
                S.No
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  sx={{
                    minWidth: column.minWidth || 80,
                    width: column.width || 120,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    padding: "6px 12px",
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                    "&:last-child": { borderRight: "none" },
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              <TableCell
                sx={{
                  width: actions.length > 0 ? "120px" : "100px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  padding: "6px 12px",
                  borderBottom: "1px solid #e0e0e0",
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
                  "&:hover": { backgroundColor: "#fefefe" },
                }}
              >
                <TableCell
                  sx={{
                    padding: "6px 12px",
                    fontSize: "0.82rem",
                    borderBottom: "1px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                  }}
                >
                  {(page - 1) * rowsPerPage + index + 1}
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={`${row.id}-${column.field}`}
                    sx={{
                      padding: "6px 12px",
                      fontSize: "0.82rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #e0e0e0",
                      borderRight: "1px solid #e0e0e0",
                      "&:last-child": { borderRight: "none" },
                      cursor: column.clickable ? "pointer" : "default",
                    }}
                    onClick={() => handleCellClick(row, column)}
                  >
                    {column.clickable ? (
                      <Link
                        component="span"
                        sx={{
                          color: "primary.main",
                          fontWeight: 500,
                          fontSize: "0.83rem",
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                            color: "primary.dark",
                          },
                        }}
                      >
                        {row[column.field]}
                      </Link>
                    ) : (
                      row[column.field]
                    )}
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    padding: "6px 12px",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {actions.map((action) => (
                      <IconButton
                        key={action.title}
                        onClick={() => action.onClick(row)}
                        size="small"
                        sx={{
                          color: action.color,
                          "&:hover": {
                            backgroundColor: "rgba(2, 136, 209, 0.08)",
                          },
                        }}
                        title={action.title}
                      >
                        {action.icon}
                      </IconButton>
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page - 1} // Convert to 0-based index for MUI TablePagination
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: "1px solid #e0e0e0",
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              margin: 0,
            },
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default ReusableTable;
