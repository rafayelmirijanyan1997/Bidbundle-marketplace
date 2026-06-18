import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator} from 'react-native';
import {useAuth} from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import HomeownerNavigator from './HomeownerNavigator';
import ProviderNavigator from './ProviderNavigator';
import AdminNavigator from './AdminNavigator';
import HoaHomeownerNavigator from './HoaHomeownerNavigator';
import {colors} from '../theme';

export default function RootNavigator() {
  const {user, setUser, loading, logout} = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.cream50,
        }}>
        <ActivityIndicator color={colors.terracotta600} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator onAuth={setUser} />
      ) : user.role === 'homeowner' ? (
        <HomeownerNavigator onLogout={logout} />
      ) : user.role === 'provider' ? (
        <ProviderNavigator onLogout={logout} />
      ) : user.role === 'admin' ? (
        <AdminNavigator onLogout={logout} />
      ) : (
        <HoaHomeownerNavigator onLogout={logout} />
      )}
    </NavigationContainer>
  );
}
