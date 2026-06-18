import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../theme';
import {Home, ClipboardList, MessageCircle, User, Building2} from 'lucide-react-native';
import HoaDashboardScreen from '../screens/hoa_homeowner/HoaDashboardScreen';
import HoaProfileScreen from '../screens/hoa_homeowner/HoaProfileScreen';
import HoaCommunityScreen from '../screens/hoa_homeowner/HoaCommunityScreen';
import BidsScreen from '../screens/homeowner/BidsScreen';
import ChatScreen from '../screens/homeowner/ChatScreen';

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
}

export default function HoaHomeownerNavigator({onLogout}: Props) {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.terracotta600,
          tabBarInactiveTintColor: colors.ink400,
          tabBarStyle: {
            backgroundColor: colors.bgCard,
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: 0,
            borderTopWidth: 0,
            borderRadius: 26,
            height: 76,
            paddingBottom: 10,
            paddingTop: 8,
            paddingHorizontal: 10,
            shadowColor: '#1A120A',
            shadowOpacity: 0.1,
            shadowRadius: 18,
            shadowOffset: {width: 0, height: 10},
            elevation: 14,
          },
          tabBarItemStyle: {marginHorizontal: 0, marginVertical: 4},
          tabBarShowLabel: false,
          sceneStyle: {backgroundColor: colors.bgApp},
        }}>
        <Tab.Screen
          name="Home"
          component={HoaDashboardScreen}
          options={{
            tabBarIcon: ({color, size, focused}) => (
              <TabIcon label="Home" focused={focused}>
                <Home color={color} size={size - 2} strokeWidth={2} />
              </TabIcon>
            ),
          }}
        />
        <Tab.Screen
          name="Bids"
          component={BidsScreen}
          options={{
            tabBarIcon: ({color, size, focused}) => (
              <TabIcon label="My Bids" focused={focused}>
                <ClipboardList color={color} size={size - 2} strokeWidth={2} />
              </TabIcon>
            ),
          }}
        />
        <Tab.Screen
          name="Community"
          component={HoaCommunityScreen}
          options={{
            tabBarIcon: ({color, size, focused}) => (
              <TabIcon label="Community" focused={focused}>
                <Building2 color={color} size={size - 2} strokeWidth={2} />
              </TabIcon>
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarIcon: ({color, size, focused}) => (
              <TabIcon label="Chat" focused={focused}>
                <MessageCircle color={color} size={size - 2} strokeWidth={2} />
              </TabIcon>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          options={{
            tabBarIcon: ({color, size, focused}) => (
              <TabIcon label="Profile" focused={focused}>
                <User color={color} size={size - 2} strokeWidth={2} />
              </TabIcon>
            ),
          }}>
          {() => <HoaProfileScreen onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
}

function TabIcon({children, label, focused}: {children: React.ReactNode; label: string; focused: boolean}) {
  return (
    <View style={st.item}>
      <View style={[st.iconWrap, focused && st.iconWrapActive]}>{children}</View>
      <Text style={[st.label, focused && st.labelActive]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  item: {alignItems: 'center', justifyContent: 'center', width: 60},
  iconWrap: {width: 36, height: 30, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  iconWrapActive: {backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: colors.border},
  label: {fontSize: 11, fontWeight: '600', color: colors.ink500, marginTop: 3},
  labelActive: {color: colors.terracotta600},
});
