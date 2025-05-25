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
    clickable?: boolean; // Add clickable property
  }[];
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
  onView?: (row: any) => void; // Add optional onView prop
}

const ReusableTable: React.FC<UserTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
}) => {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        No data found.
      </Typography>
    );
  }

  const handleCellClick = (row: any, column: any) => {
    if (column.clickable && onView) {
      onView(row);
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
            tableLayout: "fixed", // tighter layout
            borderCollapse: "collapse",
          }}
          size="small" // makes table more compact
          aria-label="user table"
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
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
                  width: onView ? "120px" : "100px",
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
            {data.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  "&:hover": { backgroundColor: "#fefefe" },
                }}
              >
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
                    {onView && (
                      <IconButton
                        onClick={() => onView(row)}
                        size="small"
                        sx={{
                          color: "info.main",
                          "&:hover": {
                            backgroundColor: "rgba(2, 136, 209, 0.08)",
                          },
                        }}
                        title="View"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => onEdit(row)}
                      size="small"
                      sx={{
                        color: "primary.main",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => onDelete(row)}
                      size="small"
                      sx={{
                        color: "error.main",
                        "&:hover": {
                          backgroundColor: "rgba(211, 47, 47, 0.08)",
                        },
                      }}
                      title="Delete"
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
