import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import InviteSignUpScreen from '../screens/auth/InviteSignUpScreen';
import {User} from '../api/auth';

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Register: undefined;
  InviteSignUp: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface Props {
  onAuth: (user: User) => void;
}

export default function AuthNavigator({onAuth}: Props) {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn">
        {props => <SignInScreen {...props} onAuth={onAuth} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {props => <RegisterScreen {...props} onAuth={onAuth} />}
      </Stack.Screen>
      <Stack.Screen name="InviteSignUp">
        {props => <InviteSignUpScreen {...props} onAuth={onAuth} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
