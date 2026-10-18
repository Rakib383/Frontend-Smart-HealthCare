
import LoginForm from '@/components/modules/Auth/LoginForm'


interface LoginParams {
  searchParams:Promise<{redirect?:string}>;
}

const loginPage = async ({searchParams}:LoginParams) => {

  const params = await searchParams;
  const redirectPath = params.redirect


  return (
    
      <LoginForm redirectPath={redirectPath}/>
    
  )
}

export default loginPage
