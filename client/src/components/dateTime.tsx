import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import '../assets/css/header.css'; 

const DateTime: React.FC = () => {
  const [Time, setTime] = useState<string>("");
  const [Day, setDate] = useState<string>("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentDate = new Date();
      const time = currentDate.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const weekday = currentDate.toLocaleString('en-US', { weekday: 'long' });
      const day = currentDate.getDate();
      const month = currentDate.toLocaleString('en-US', { month: 'long' });
      setTime(`${time}`);
      setDate(`${weekday}, ${day} ${month}`);
    }, 1000); 
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <Typography variant="h6" 
        sx={{fontSize: "15px"}}
      >
        {Time} - {Day}
      </Typography>
    </div>
  );
};

export default DateTime;
