import React from "react";
import { Box, TextField, MenuItem, InputAdornment, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function SearchBar({ value, onChange, placeholder }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      color="blackColor"
      onChange={onChange}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="secondary" />
          </InputAdornment>
        ),
        sx: { borderRadius: "50px", backgroundColor: "#fff" },
      }}
    />
  );
}

export default SearchBar;
