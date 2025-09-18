import React from "react";
import { Card, TextField } from "@mui/material";

export default function UrlForm({ index, data, onChange }: any) {
  return (
    <Card style={{ padding: 16, marginBottom: 16 }}>
      <TextField
       label="URL"
        fullWidth
        value={data.url}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(index, "url", e.target.value)
        }
      />

      <TextField
        label="Validity (minutes)"
        type="number"
        fullWidth
        value={data.validity}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(index, "validity", e.target.value)
        }
      />
      <TextField
        label="Custom Shortcode"
        fullWidth
        value={data.shortcode}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(index, "shortcode", e.target.value)
        }
      />
    </Card>
  );
}
