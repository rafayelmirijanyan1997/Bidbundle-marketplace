import React, {useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Modal, View, Text, StyleSheet} from 'react-native';
import {colors} from '../theme';
import DashboardScreen from '../screens/homeowner/DashboardScreen';
import BidsScreen from '../screens/homeowner/BidsScreen';
import ChatScreen from '../screens/homeowner/ChatScreen';
import ProfileScreen from '../screens/homeowner/ProfileScreen';
import NewRequestScreen from '../screens/homeowner/NewRequestScreen';
import QuoteCheckScreen from '../screens/homeowner/QuoteCheckScreen';
import {Home, ClipboardList, MessageCircle, User, Plus, Sparkles} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
}

export default function HomeownerNavigator({onLogout}: Props) {
  const [showNewRequest, setShowNewRequest] = useState(false);

  return (
    <>
      <Modal
        visible={showNewRequest}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewRequest(false)}>
        <NewRequestScreen
          onDone={() => setShowNewRequest(false)}
          onBack={() => setShowNewRequest(false)}
        />
      </Modal>

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
          tabBarItemStyle: {
            marginHorizontal: 0,
            marginVertical: 4,
          },
          tabBarShowLabel: false,
          sceneStyle: {backgroundColor: colors.bgApp},
        }}>
        <Tab.Screen
          name="Home"
          component={DashboardScreen}
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
          name="New"
          component={DashboardScreen}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              setShowNewRequest(true);
            },
          }}
          options={{
            tabBarIcon: ({color, size, focused}) => (
              <TabIcon label="New" focused={focused}>
                <Plus color={color} size={size - 1} strokeWidth={2.8} />
              </TabIcon>
            ),
            tabBarActiveTintColor: colors.terracotta600,
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
          name="Quote"
          component={QuoteCheckScreen}
          options={{
            tabBarIcon: ({color, size, focused}) => (
              <TabIcon label="Quote" focused={focused}>
                <Sparkles color={color} size={size - 2} strokeWidth={2} />
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
          {() => <ProfileScreen onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
}

function TabIcon({
  children,
  label,
  focused,
}: {
  children: React.ReactNode;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={stylesTab.item}>
      <View style={[stylesTab.iconWrap, focused && stylesTab.iconWrapActive]}>{children}</View>
      <Text style={[stylesTab.label, focused && stylesTab.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const stylesTab = StyleSheet.create({
  item: {alignItems: 'center', justifyContent: 'center', width: 60},
  iconWrap: {
    width: 36,
    height: 30,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink500,
    marginTop: 3,
  },
  labelActive: {color: colors.terracotta600},
});
