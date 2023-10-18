import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import logo from '../../assets/karangos-logo-600px.png'
import MainMenu from './MainMenu'
import myfetch from '../../utils/myfetch'
import Buttom from '@mui/material/Button'
import PersonIcon from '@mui/icons-material/Person'
import { useLocation, useNavigate } from 'react-router-dom'
import UserMenu from './UserMenu'

export default function TopBar() {

  const [loggedInUser, setLoggedInUser] = React.useState(null)

  const location = useLocation()
  
  const navigate = useNavigate()

  // para ser executado quando o componente carrega
  React.useEffect(() => {
    fetchLoggedInUser()
  }, [location])

  async function fetchLoggedInUser() {
    try {
      const user = await myfetch.get('user/loggedin')
      setLoggedInUser(user)
    }
    catch(error) {
      setLoggedInUser(null)
      // se não foi possivel obter os dados do usuário autenticado, redireciona para a página de login
      if(location.pathname !== '/login') navigate('/login')
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" enableColorOnDark sx={{ justifyContent: 'space-between', flexDirection: 'row'}}>
        <Toolbar variant="dense">
          
          <MainMenu />

          <img src={logo} alt="Logotipo Karangos" style={{ width: '300px' }} />
        </Toolbar>
        
         <UserMenu user={loggedInUser} />
        
      </AppBar>
    </Box>
  );
}