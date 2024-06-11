import { LoadingButton } from "@mui/lab";
import { Box, Container, TextField, Typography, Button, List, ListItem, ListItemText } from "@mui/material";
import { useState, useEffect } from "react";

const API_WEATHER = `https://api.weatherapi.com/v1/current.json?key=${
  import.meta.env.VITE_API_KEY
}&lang=es&q=`;

export default function App() {
  const [city, setCity] = useState("");
  const [error, setError] = useState({ error: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState({
    city: "",
    country: "",
    temperature: 0,
    condition: "",
    conditionText: "",
    icon: "",
  });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    setHistory(savedHistory);
  }, []);

  const saveToHistory = (newItem) => {
    // Formatear la fecha como una cadena antes de guardarla en el historial
    newItem.date = newItem.date.toISOString();
    
    const updatedHistory = [newItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('weatherHistory', JSON.stringify(updatedHistory));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError({ error: false, message: "" });
    setLoading(true);

    try {
      if (!city.trim()) throw { message: "El campo ciudad es obligatorio" };
    
      if (!import.meta.env.VITE_API_KEY) {
        throw { message: "API key no configurada" };
      }
    
      const res = await fetch(API_WEATHER + city);
      if (!res.ok) {
        throw { message: `Error en la solicitud: ${res.statusText}` };
      }
    
      const data = await res.json();
    
      if (data.error) {
        throw { message: data.error.message };
      }
    
      setWeather({
        city: data.location.name,
        country: data.location.country,
        temperature: data.current.temp_c,
        condition: data.current.condition.code,
        conditionText: data.current.condition.text,
        icon: data.current.condition.icon,
      });
    
      saveToHistory({ 
        city: data.location.name, 
        country: data.location.country, 
        date: new Date() 
      });
    
    } catch (error) {
      console.log(error);
      setError({ error: true, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Weather App
      </Typography>
      <Box
        sx={{ display: "grid", gap: 2 }}
        component="form"
        autoComplete="off"
        onSubmit={onSubmit}
      >
        <TextField
          id="city"
          label="Ciudad"
          variant="outlined"
          size="medium"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={error.error}
          helperText={error.message}
        />

        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          loadingIndicator="Buscando..."
        >
          Buscar
        </LoadingButton>
      </Box>

      {weather.city && (
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h2" component="h2">
            {weather.city}, {weather.country}
          </Typography>
          <Box
            component="img"
            alt={weather.conditionText}
            src={weather.icon}
            sx={{ margin: "0 auto" }}
          />
          <Typography variant="h3" component="h2">
            {weather.temperature} °C
          </Typography>
          <Typography variant="h3" component="h2">
            {weather.conditionText}
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        color="secondary"
        onClick={toggleHistory}
        fullWidth
        sx={{ mt: 2 }}
      >
        {showHistory ? 'Ocultar Historial' : 'Mostrar Historial'}
      </Button>

      {showHistory && (
        <List sx={{ mt: 2 }}>
          {history.map((item, index) => (
            <ListItem key={index}>
              <ListItemText primary={`${item.city}, ${item.country}`} secondary={new Date(item.date).toLocaleString()} />
            </ListItem>
         

          ))}
        </List>
      )}

      <Typography textAlign="center" sx={{ mt: 2, fontSize: "20px" }}>
        Powered by:{" "}
        <a href="https://www.weatherapi.com/" title="Weather API">
          WeatherAPI.com
        </a>
      </Typography>
    </Container>
  );
}
