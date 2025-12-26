import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Paper } from "@mui/material";

const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First name", width: 150 },
    { field: "lastName", headerName: "Last name", width: 150 },
    { field: "age", headerName: "Age", type: "number", width: 110 },
];

const rows = [
    { id: 1, lastName: "Singh", firstName: "Amit", age: 25 },
    { id: 2, lastName: "Kumar", firstName: "Ravi", age: 30 },
    { id: 3, lastName: "Sharma", firstName: "Priya", age: 28 },
    { id: 4, lastName: "Das", firstName: "Anu", age: 26 },
    { id: 5, lastName: "Gupta", firstName: "Raj", age: 32 },
];

const paginationModel = { page: 0, pageSize: 5 };

const SampleTable = () => {
    const [selectedIds, setSelectedIds] = React.useState([]);

    return (
        <div>
            <Paper sx={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    checkboxSelection
                    pageSize={5}
                    rowsPerPageOptions={[5, 10]}
                    // initialState={{
                    //     pagination: { paginationModel },
                    // }}
                    getRowId={(row) => row.id}
                    sx={{ border: 0 }}
                    rowSelectionModel={selectedIds}
                    onSelectionModelChange={(newSelection) => {
                        console.log("Selected IDs:", newSelection);
                        setSelectedIds(newSelection);
                    }}
                />
            </Paper>

            <div style={{ marginTop: "20px" }}>
                <strong>Selected IDs: </strong> {JSON.stringify(selectedIds)}
            </div>
        </div>
    );
};

export default SampleTable;
