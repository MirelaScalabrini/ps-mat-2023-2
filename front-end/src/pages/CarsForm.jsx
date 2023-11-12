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
import  InputAdornment  from '@mui/material/InputAdornment'
import Car from '../models/car'
import { ZodError } from 'zod'

export default function CarsForm() {

  const navigate = useNavigate()
  const params = useParams()

  const carDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_date: null,
    customer_id: ''
  }

  const [state, setState] = React.useState({
    car: carDefaults, 
    customers: [],  
    showWaiting: false,
    notification: {
      show: false,
      severity: 'success',
      message: ''
    },
    openDialog: false,
    isFormModified: false,
    validationErrors: {}
  })

  const {
    car,
    customers,
    showWaiting,
    notification,
    openDialog,
    isFormModified,
    validationErrors 
  } = state

  const anos = []             

  // Anos, do mais recente ao mais antigo
  for(let ano = 2023; ano >= 1940; ano--) anos.push(ano)

  const maskFormatChars = {
      '9': '[0-9]',
      'a': '[A-Za-z]',
      '*': '[A-Za-z0-9]',
      '@': '[A-Ja-j0-9]', // Aceita letras de A a J (maiúculas ou minúsculas) e digitos
      '_': '[\s0-9]' // um espaço em branco ou um dígito
  }

  //useEffect com vetor de dependências vazio. Será executado uma vez quando o componente for carregado
  React.useEffect(() => {
    // Verifica de existe o parâmetro id na rota. Caso exista chama a função
    fetchData(params.id)
  }, [])

  async function fetchData(isUpdating) {
    // Exibe 
    setState({...state, showWaiting: true})
    try {
      let car = carDefaults
      if(isUpdating){
        car = await myfetch.get(`car/${params.id}`)
         // Verifica se selling_date é uma string não vazia antes de converter
      if (typeof car.selling_date === 'string' && car.selling_date.trim() !== '') {
        car.selling_date = parseISO(car.selling_date);
      } else {
        car.selling_date = null;
      }
    }

      // Busca a listagem de clientes para preencher o componente de escolha
      let customers = await myfetch.get('customer')

      // Cria um cliente "fake" que permite não selecionar nenhum cliente
      customers.unshift({id: null, name: '(Nenhum cliente)'})

      setState({...state, showWaiting: false, car, customers})
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
    let value
    if (event.target.name === 'imported') {
      // Verifica se é importado
      value = event.target.checked;
    } else if (event.target.name === 'year_manufacture') {
      // Transforma o ano de fabricação em inteiro
      value = parseInt(event.target.value);
    } else if (event.target.name === 'selling_price') {
      // Verifica se é uma string vazia ou não é um número válido
      value = isNaN(parseFloat(event.target.value)) ? null : parseFloat(event.target.value);
    } else {
      // Para outros campos, pega diretamente o valor
      value = event.target.value;
    }
    newCar[event.target.name] = value    
    
    setState({ ...state, 
      car: newCar, 
      isFormModified: true  // O fromulário foi alterado
     })
  }

  async function handleFormSubmit(event) {
    setState({ ...state, showWaiting: true }) // Exibe o backdrop
    event.preventDefault(false)   // Evita o recarregamento da página
    try {
      //chama a validação da biblioteca Zod
      Car.parse(car)

      let result 
      if(car.id) result = await myfetch.put(`car/${car.id}`, car)
      else result = await myfetch.post('car', car)
      
      setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'success',
          message: 'Dados salvos com sucesso.',
          validationErrors: {}
        }  
      })  
    }
    catch(error) {
      if(error instanceof ZodError) {
        console.error(error)

        //Preenchendo os estados validationError para exibir os erros para o usuário
        let valErrors = {}
        for(let e of error.issues) valErrors[e.path[0]] = e.message
        
        setState({
          ...state,
          validationErrors: valErrors,
          showWaiting: false, // Esconde o backdrop
          notification: {
            show: true,
            severity: 'error',
            message: 'ERRO: há campos inválidos no formulário.'
          }
        })
      }
      else setState({ ...state, 
        showWaiting: false, // Esconde o backdrop
        notification: {
          show: true,
          severity: 'error',
          message: 'ERRO: ' + error.message,
          validationErrors: {}
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
            error={validationErrors?.brand}
            helperText={validationErrors?.brand}
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
            error={validationErrors?.model}
            helperText={validationErrors?.model}
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
            error={validationErrors?.color}
            helperText={validationErrors?.color}
          />
        
        <TextField
            id="year_manufacture"
            name="year_manufacture" 
            label="Ano de fabricação"
            select
            defaultValue=""
            fullWidth
            variant="filled"
            helperText="Selecione o ano"
            value={car.year_manufacture}
            onChange={handleFieldChange}
          >
          {anos.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

          <FormControlLabel 
            className="MuiFormControl-root"
            sx={{ justifyContent: "start" }}
            onChange={handleFieldChange} 
            control={<Switch defaultChecked />} 
            label="Importado" 
            id="imported" 
            name="imported" 
            labelPlacement="start" 
            checked={car.imported}
        />

          <InputMask
            mask="aaa-9@99"
            formatChars={maskFormatChars}
            maskChar=" "
            value={car.plates.toUpperCase()}
            onChange={(event) => handleFieldChange({ target: { name: 'plates', value: event.target.value } })}
          >
            {() => (
              <TextField
                id="plates"
                name="plates"
                label="Placa"
                variant="filled"
                required
                fullWidth
                error={validationErrors?.plates}
                helperText={validationErrors?.plates}
              />
            )}
          </InputMask>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptLocale}>
          <DatePicker
            label="Data de venda"
            value={car.selling_date}
            onChange={(value) =>
              handleFieldChange({ target: { name: 'selling_date', value } })
            }
            slotProps={{
              textField: {
                variant: 'filled',
                fullWidth: true,
                error: validationErrors?.selling_date,
                helperText: validationErrors?.selling_date,
              },
            }}
          />
        </LocalizationProvider>
          
          <TextField
          id="selling_price"
          name="selling_price"
          label="Valor do carro"
          variant="filled"
          fullWidth
          InputProps={{ startAdornment:<InputAdornment position='start'>R$</InputAdornment> }}
          type="number"
          value={car.selling_price !== null ? car.selling_price : ''}
          onChange={handleFieldChange}
          error={validationErrors?.selling_price}
          helperText={validationErrors?.selling_price}
        >
          </TextField>

          <TextField
            id="customer_id"
            name="customer_id"
            label="Cliente adquirente"
            select
            defaultValue=""
            fullWidth
            variant="filled"
            helperText="Selecione o cliente"
            value={car.customer_id}
            onChange={handleFieldChange}
          >
          {customers.map(customer => (
            <MenuItem key={customer.id} value={customer.id}>
              {customer.name}
            </MenuItem>
          ))}
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