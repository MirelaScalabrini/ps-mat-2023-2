import React from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import myfetch from '../utils/myfetch'
import Waiting from '../components/ui/Waiting'
import Notification from '../components/ui/Notification'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import InputMask from 'react-input-mask'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptLocale from 'date-fns/locale/pt-BR'
import { parseISO } from 'date-fns'

import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

export default function CarsForm() {

  const navigate = useNavigate()
  const params = useParams()

  const customarDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_date: null
  }

  const [state, setState] = React.useState({
    car: customarDefaults,   
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    },
    openDialog: false,
    isFormModified: false
  })

  const {
    car,
    showWaiting,
    notification,
    openDialog,
    isFormModified 
  } = state

  const datas = [
    { label: '1940' }, { label: '1941' }, { label: '1942' }, { label: '1943' }, { label: '1944' }, { label: '1945' }, { label: '1946' },
    { label: '1947' }, { label: '1948' }, { label: '1949' }, { label: '1950' }, { label: '1951' }, { label: '1952' }, { label: '1953' },
    { label: '1954' }, { label: '1955' }, { label: '1956' }, { label: '1957' }, { label: '1958' }, { label: '1959' }, { label: '1960' }, 
    { label: '1961' }, { label: '1962' }, { label: '1963' }, { label: '1964' }, { label: '1965' }, { label: '1966' }, { label: '1967' }, 
    { label: '1968' }, { label: '1969' }, { label: '1970' }, { label: '1971' }, { label: '1972' }, { label: '1973' }, { label: '1974' },
    { label: '1975' }, { label: '1976' }, { label: '1977' }, { label: '1978' }, { label: '1979' }, { label: '1980' }, { label: '1981' }, 
    { label: '1982' }, { label: '1983' }, { label: '1984' }, { label: '1985' }, { label: '1986' }, { label: '1987' }, { label: '1988' },
    { label: '1989' }, { label: '1990' }, { label: '1991' }, { label: '1992' }, { label: '1993' }, { label: '1994' }, { label: '1995' }, 
    { label: '1996' }, { label: '1997' }, { label: '1998' }, { label: '1999' }, { label: '2000' }, { label: '2001' }, { label: '2002' },
    { label: '2003' }, { label: '2004' }, { label: '2005' }, { label: '2006' }, { label: '2007' }, { label: '2008' }, { label: '2009' }, 
    { label: '2010' }, { label: '2011' }, { label: '2012' }, { label: '2013' }, { label: '2014' }, { label: '2015' }, { label: '2016' },
    { label: '2017' }, { label: '2018' }, { label: '2019' }, { label: '2020' }, { label: '2021' }, { label: '2022' }, { label: '2023' }
  ]             

  const maskFormatChars = {
      '9': '[0-9]',
      'a': '[A-Za-z]',
      '*': '[A-Za-z0-9]',
      '_': '[\s0-9]' // um espaço em branco ou um dígito
  }

  //useEffect com vetor de dependências vazio. Será executado uma vez quando o componente for carregado
  React.useEffect(() => {
    // Verifica de existe o parâmetro id na rota. Caso exista chama a função
    if(params.id) fetchData()
  }, [])

  async function fetchData() {
    // Exibe 
    setState({...state, showWaiting: true})
    try {
      const result = await myfetch.get(`car/${params.id}`)

      if (result.selling_date) {
        result.selling_date = parseISO(result.selling_date);
      } else {
        result.selling_date = null;
      }
      setState({...state, showWaiting: false, car: result})
    }
    catch(error){
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message
        } 
      })  
    }
  }

  function handleFieldChange(event) {
    console.log(event)
    const newCar = { ...car }
    const value =
      event.target.name === 'imported' /*Verifica se é importado*/ ? event.target.checked : event.target.name === 'year_manufacture' // Transforma a data de fabricação em inteiro
      ? parseInt(event.target.value) : event.target.name === 'selling_price'
      ? event.target.value.trim() === '' // Verifica se é uma string vazia se não 
        ? null // Define como null ao editar e apagar o valor caso tenha preenchido
        : event.target.value : event.target.value; 
    newCar[event.target.name] = value;     
    
    setState({ ...state, 
      car: newCar, 
      isFormModified: true  // O fromulário foi alterado
     })
  }

  async function handleFormSubmit(event) {
    setState({ ...state, showWaiting: true }) // Exibe o backdrop
    event.preventDefault(false)   // Evita o recarregamento da página
    try {
      let result 
      if(car.id) result = await myfetch.put(`car/${car.id}`, car)
      else result = await myfetch.post('car', car)
      
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'success',
          message: 'Dados salvos com sucesso.'
        }  
      })  
    }
    catch(error) {
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message
        } 
      })  
    }
  }

  function handleNotificationClose() {
    const status = notification.severity
    
    // Fecha a barra de notificação
    setState({...state, notification: { 
      show: false,
      severity: status,
      message: ''
    }})

    // Volta para a página de listagem
    if(status === 'success') navigate('..', { relative: 'path' })
  }

  function handleBackButtonClose(event) {
    // Se o formulário tiver sido modificado, abre a caixa de diálogo
    // para perguntar se quer mesmo voltar, perdendo as alterações
    if(isFormModified) setState({ ...state, openDialog: true })

    // Senão, volta à página de listagem
    else navigate('..', { relative: 'path' })
  }

  function handleDialogClose(answer) {

    // Fechamos a caixa de diálogo
    setState({ ...state, openDialog: false })

    // Se o usuário tiver respondido quer quer voltar à página
    // de listagem mesmo com alterações pendentes, faremos a
    // vontade dele
    if(answer) navigate('..', { relative: 'path' })
  }

  return(
    <>

      <ConfirmDialog
        title="Atenção"
        open={openDialog}
        onClose={handleDialogClose}
      >
        Há alterações que ainda não foram salvas. Deseja realmente voltar?
      </ConfirmDialog>

      <Waiting show={showWaiting} />

      <Notification
        show={notification.show}
        severity={notification.severity}
        message={notification.message}
        onClose={handleNotificationClose}
      /> 

      <Typography variant="h1" sx={{ mb: '50px' }}>
        Cadastro de carros
      </Typography>

      <form onSubmit={handleFormSubmit}>

        <Box className="form-fields">
        
         <TextField 
            id="brand"
            name="brand" 
            label="Marca" 
            variant="filled"
            required
            fullWidth
            value={car.brand}
            onChange={handleFieldChange}
            autoFocus
         />

          <TextField
            id="model"
            name="model" 
            label="Modelo" 
            variant="filled"
            required
            fullWidth
            value={car.model}
            onChange={handleFieldChange}
          />

          <TextField 
            id="color"
            name="color" 
            label="Cor" 
            variant="filled"
            required
            fullWidth
            value={car.color}
            onChange={handleFieldChange}
          />
        
          <TextField 
            id="year_manufacture"
            name="year_manufacture" 
            label="Ano de fabricação"
            select  
            variant="filled"
            required
            fullWidth
            value={car.year_manufacture}
            onChange={handleFieldChange}
          >
             {datas.map((option) => (
              <MenuItem key={option.label} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                id="imported"
                name="imported"
                value={car.imported}
                onChange={handleFieldChange}
              />
            }
            label="É importado?"
            className="switch-label"
          />

          <InputMask
            mask="aaa-9a99"
            formatChars={maskFormatChars}
            maskChar=" "
            value={car.plates}
            onChange={handleFieldChange}
          >
            {
              () => <TextField
                id="plates"
                name="plates"
                label="Placa"
                variant="filled"
                required
                fullWidth
              />
            }
          </InputMask>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptLocale}>
            <DatePicker
              label="Data de venda"
              value={car.selling_date}
              onChange={ value => 
                handleFieldChange({ target: { name: 'selling_date', value } }) 
              }
              slotProps={{ textField: { variant: 'filled', fullWidth: true } }}
            />
          </LocalizationProvider>
          
          <TextField
          id="selling_price"
          name="selling_price"
          label="Valor do carro"
          variant="filled"
          fullWidth
          value={car.selling_price !== null ? car.selling_price : ''}
          onChange={handleFieldChange}
          type="number"
        >
          </TextField>
          
        </Box>

        <Box sx={{ fontFamily: 'monospace' }}>
          { JSON.stringify(car) }
        </Box>

        <Toolbar sx={{ justifyContent: "space-around" }}>
          <Button variant="contained" color="secondary" type="submit">Salvar</Button>
          <Button variant="outlined" onClick={handleBackButtonClose}>Voltar</Button>
        </Toolbar>
      
      </form>
    </> 
  )
}