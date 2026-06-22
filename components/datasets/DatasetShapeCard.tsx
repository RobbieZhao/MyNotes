"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
  COLUMN_TYPE_LABELS,
  DATASET_SHAPE_LABELS,
  type ColumnMetadata,
  type DatasetShape,
} from "@/lib/datasets/datasetTypes";

interface DatasetShapeCardProps {
  shape: DatasetShape;
  confidence: number;
  columns: ColumnMetadata[];
}

export function DatasetShapeCard({ shape, confidence, columns }: DatasetShapeCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h6">Detected shape</Typography>
          <Chip label={DATASET_SHAPE_LABELS[shape]} color="primary" size="small" />
          <Chip
            label={`${Math.round(confidence * 100)}% confidence`}
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Column analysis
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Column</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Numeric %</TableCell>
                <TableCell align="right">Date %</TableCell>
                <TableCell align="right">Unique</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {columns.map((column) => (
                <TableRow key={column.name}>
                  <TableCell>{column.name}</TableCell>
                  <TableCell>{COLUMN_TYPE_LABELS[column.type]}</TableCell>
                  <TableCell align="right">{Math.round(column.numericPercent * 100)}%</TableCell>
                  <TableCell align="right">{Math.round(column.datePercent * 100)}%</TableCell>
                  <TableCell align="right">{column.uniqueCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}
