export interface AuthFormData {
  name: string;
  username: string;
  password: string;
}

export interface RegisterFormData {
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  password: string;
}

export interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

export interface LoginFormProps {
  formData: AuthFormData;
  isLoading: boolean;
  rememberMe: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
}

export interface RegisterFormProps {
  formData: RegisterFormData;
  isLoading: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
}

export interface InfoPanelProps {
  isLogin: boolean;
}

