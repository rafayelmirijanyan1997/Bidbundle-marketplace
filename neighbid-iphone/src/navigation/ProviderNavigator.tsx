import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, StyleSheet} from 'react-native';
import {colors} from '../theme';
import {Home, Briefcase, ClipboardList, MessageCircle, User, CalendarDays} from 'lucide-react-native';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import ProviderJobFeedScreen from '../screens/provider/ProviderJobFeedScreen';
import ProviderBidsScreen from '../screens/provider/ProviderBidsScreen';
import ProviderMessagesScreen from '../screens/provider/ProviderMessagesScreen';
import ProviderProfileScreen from '../screens/provider/ProviderProfileScreen';
import ProviderCalendarScreen from '../screens/provider/ProviderCalendarScreen';

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
}

export default function ProviderNavigator({onLogout}: Props) {
  return (
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
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <TabIcon label="Home" focused={focused}>
              <Home color={color} size={size - 2} strokeWidth={2} />
            </TabIcon>
          ),
        }}>
        {({navigation}) => (
          <ProviderDashboardScreen
            onGoToJobs={() => navigation.navigate('Jobs')}
            onGoToBids={() => navigation.navigate('Bids')}
            onGoToCalendar={() => navigation.navigate('Calendar')}
            onGoToMessages={() => navigation.navigate('Messages')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Jobs"
        component={ProviderJobFeedScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <TabIcon label="Job Feed" focused={focused}>
              <Briefcase color={color} size={size - 2} strokeWidth={2} />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Bids"
        component={ProviderBidsScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <TabIcon label="My Bids" focused={focused}>
              <ClipboardList color={color} size={size - 2} strokeWidth={2} />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={ProviderCalendarScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <TabIcon label="Calendar" focused={focused}>
              <CalendarDays color={color} size={size - 2} strokeWidth={2} />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ProviderMessagesScreen}
        options={{
          tabBarIcon: ({color, size, focused}) => (
            <TabIcon label="Messages" focused={focused}>
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
          {() => <ProviderProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
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
      <View style={[stylesTab.iconWrap, focused && stylesTab.iconWrapActive]}>
        {children}
      </View>
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
