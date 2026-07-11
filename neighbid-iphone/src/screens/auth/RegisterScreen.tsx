import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator, Switch, UIManager,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Geolocation from '@react-native-community/geolocation';
import {MapPin, CheckCircle, AlertCircle, Navigation} from 'lucide-react-native';
import {Button} from '../../components/Button';
import {colors, radius} from '../../theme';
import {register, registerHoa, User, Role} from '../../api/auth';
import {apiFetch} from '../../api/client';
import {AuthStackParamList} from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'> & {
  onAuth: (user: User) => void;
};

type Step = 1 | 2 | 3 | 4 | 5;
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

let MapsLibrary: any = null;
try {
  MapsLibrary = require('react-native-maps');
} catch {
  MapsLibrary = null;
}

const MapViewNative = MapsLibrary?.default ?? null;
const MarkerNative = MapsLibrary?.Marker ?? null;
const hasNativeMapView =
  Boolean(MapViewNative && MarkerNative) &&
  (Platform.OS !== 'ios' || Boolean(UIManager.getViewManagerConfig?.('AIRMap')));

const SERVICE_OPTIONS = [
  'Plumbing', 'Electrical', 'HVAC', 'Lawn care',
  'Cleaning', 'Handyman', 'Roofing', 'Painting', 'Pest control',
];

const RADIUS_OPTIONS = [5, 10, 15, 25, 40];
const WEST_ADAMS_REGION: Region = {
  latitude: 34.0379,
  longitude: -118.342,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
};

// ── Step dots ────────────────────────────────────────────────────────────────
function StepDots({current, total}: {current: Step; total: number}) {
  return (
    <View style={dots.row}>
      {Array.from({length: total}, (_, i) => i + 1).map(n => (
        <View
          key={n}
          style={[
            dots.dot,
            n === current ? dots.dotActive : n < current ? dots.dotDone : dots.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}
const dots = StyleSheet.create({
  row: {flexDirection: 'row', gap: 6, alignItems: 'center'},
  dot: {height: 7, borderRadius: 4},
  dotActive: {width: 24, backgroundColor: colors.terracotta600},
  dotDone: {width: 7, backgroundColor: 'rgba(194,85,43,0.4)'},
  dotInactive: {width: 7, backgroundColor: colors.border},
});

// ── Step 1: Account details ──────────────────────────────────────────────────
function Step1({
  role,
  name, email, password, phone,
  onName, onEmail, onPassword, onPhone,
  onNext, onBack,
}: any) {
  const canContinue = name.trim() && email.trim() && password.length >= 6;
  const totalSteps = role === 'provider' ? 4 : role === 'homeowner' ? 4 : 3;
  return (
    <ScrollView contentContainerStyle={s.stepContent} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.stepEyebrow}>Step 2 of {totalSteps}</Text>
      <Text style={s.stepTitle}>Create your account</Text>
      <Text style={s.stepSub}>Join your neighbourhood. Start saving as a group.</Text>
      <StepDots current={2} total={totalSteps} />

      <View style={s.fields}>
        {[
          {label: 'FULL NAME', value: name, onChange: onName, placeholder: 'Marcus Johnson', secure: false, keyboard: 'default' as const, cap: 'words' as const},
          {label: 'EMAIL', value: email, onChange: onEmail, placeholder: 'marcus@email.com', secure: false, keyboard: 'email-address' as const, cap: 'none' as const},
          {label: 'PASSWORD', value: password, onChange: onPassword, placeholder: '6+ characters', secure: true, keyboard: 'default' as const, cap: 'none' as const},
          {label: 'PHONE (optional)', value: phone, onChange: onPhone, placeholder: '+1 (555) 000-0000', secure: false, keyboard: 'phone-pad' as const, cap: 'none' as const},
        ].map(f => (
          <View key={f.label} style={s.fieldWrap}>
            <Text style={s.fieldLabel}>{f.label}</Text>
            <TextInput
              style={s.input}
              value={f.value}
              onChangeText={f.onChange}
              placeholder={f.placeholder}
              placeholderTextColor={colors.ink300}
              secureTextEntry={f.secure}
              keyboardType={f.keyboard}
              autoCapitalize={f.cap}
              autoCorrect={false}
            />
          </View>
        ))}
      </View>

      <Button label="Continue" onPress={onNext} disabled={!canContinue} style={s.submitBtn} />
    </ScrollView>
  );
}

// ── Step 2: Role selection ────────────────────────────────────────────────────
function Step2({role, onRole, onNext, onBack}: any) {
  const totalSteps = role === 'provider' ? 4 : role === 'admin' ? 3 : 3;
  return (
    <ScrollView contentContainerStyle={s.stepContent} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.stepEyebrow}>Step 1 of {totalSteps}</Text>
      <Text style={s.stepTitle}>I am a…</Text>
      <Text style={s.stepSub}>Choose your role. You can always create a second account for the other role.</Text>
      <StepDots current={1} total={totalSteps} />

      <View style={s.roleCards}>
        {[
          {value: 'homeowner' as Role, label: 'Homeowner', desc: 'Group service requests with neighbours and get lower prices through collective bidding.', badge: 'Save 20–40% vs solo'},
          {value: 'provider' as Role, label: 'Service Provider', desc: 'Receive bundled group jobs from the same neighbourhood. Less driving, better revenue.', badge: 'Win whole-block jobs'},
          {value: 'admin' as Role, label: 'HOA Manager', desc: 'Manage your apartment, condo, or HOA community. Invite residents and track group savings.', badge: 'For building managers'},
        ].map(r => (
          <TouchableOpacity
            key={r.value}
            onPress={() => onRole(r.value)}
            style={[s.roleCard, role === r.value && s.roleCardActive]}>
            <View style={s.roleCardTop}>
              <Text style={[s.roleCardTitle, role === r.value && {color: colors.terracotta600}]}>
                {r.label}
              </Text>
              {role === r.value && <CheckCircle size={18} color={colors.terracotta600} strokeWidth={2.5} />}
            </View>
            <Text style={s.roleCardDesc}>{r.desc}</Text>
            <View style={s.roleBadge}>
              <Text style={s.roleBadgeText}>{r.badge}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Button label="Continue" onPress={onNext} style={s.submitBtn} />
    </ScrollView>
  );
}

// ── Step 3 (homeowner): Service interests ────────────────────────────────────
function Step3Interests({interests, onToggle, onNext, onBack}: any) {
  const canContinue = interests.length > 0;
  return (
    <ScrollView contentContainerStyle={s.stepContent} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.stepEyebrow}>Step 3 of 4</Text>
      <Text style={s.stepTitle}>What services interest you?</Text>
      <Text style={s.stepSub}>Select all that apply. This helps us match you with the right group bids in your neighbourhood.</Text>
      <StepDots current={3} total={4} />

      <View style={[s.serviceGrid, {marginTop: 24}]}>
        {SERVICE_OPTIONS.map(svc => {
          const selected = interests.includes(svc);
          return (
            <TouchableOpacity
              key={svc}
              onPress={() => onToggle(svc)}
              style={[s.serviceChip, selected && s.serviceChipActive]}>
              <Text style={[s.serviceChipText, selected && s.serviceChipTextActive]}>{svc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!canContinue && (
        <Text style={s.interestHint}>Select at least one service to continue.</Text>
      )}

      <Button label="Continue" onPress={onNext} disabled={!canContinue} style={s.submitBtn} />
    </ScrollView>
  );
}

// ── Step 3 (admin): Community setup ─────────────────────────────────────────
const COMMUNITY_TYPES = [
  {value: 'apartment', label: 'Apartment complex'},
  {value: 'condo', label: 'Condo building'},
  {value: 'hoa_neighborhood', label: 'HOA neighbourhood'},
];

function Step3Admin({data, onChange, onNext, onBack, submitting}: any) {
  const isComplete = data.communityName.trim() && data.communityType && data.communityAddress.trim();
  return (
    <ScrollView contentContainerStyle={s.stepContent} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.stepEyebrow}>Step 3 of 3</Text>
      <Text style={s.stepTitle}>Your community</Text>
      <Text style={s.stepSub}>Tell us about the property you manage so residents can find and join it.</Text>
      <StepDots current={3} total={3} />

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>COMMUNITY NAME</Text>
        <TextInput
          style={s.input}
          value={data.communityName}
          onChangeText={(v: string) => onChange('communityName', v)}
          placeholder="Sunset Gardens Apartments"
          placeholderTextColor={colors.ink300}
        />
      </View>

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>PROPERTY TYPE</Text>
        <View style={s.roleCards}>
          {COMMUNITY_TYPES.map(ct => (
            <TouchableOpacity
              key={ct.value}
              onPress={() => onChange('communityType', ct.value)}
              style={[s.roleCard, data.communityType === ct.value && s.roleCardActive]}>
              <View style={s.roleCardTop}>
                <Text style={[s.roleCardTitle, {fontSize: 15}, data.communityType === ct.value && {color: colors.terracotta600}]}>
                  {ct.label}
                </Text>
                {data.communityType === ct.value && <CheckCircle size={16} color={colors.terracotta600} strokeWidth={2.5} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>ADDRESS</Text>
        <TextInput
          style={s.input}
          value={data.communityAddress}
          onChangeText={(v: string) => onChange('communityAddress', v)}
          placeholder="123 Oak Street, Los Angeles, CA"
          placeholderTextColor={colors.ink300}
          autoCorrect={false}
        />
      </View>

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>NUMBER OF UNITS (optional)</Text>
        <TextInput
          style={s.input}
          value={data.unitCount}
          onChangeText={(v: string) => onChange('unitCount', v)}
          placeholder="e.g. 48"
          placeholderTextColor={colors.ink300}
          keyboardType="number-pad"
        />
      </View>

      <Button
        label={submitting ? 'Creating community…' : 'Create my community'}
        onPress={onNext}
        disabled={!isComplete || submitting}
        loading={submitting}
        style={s.submitBtn}
      />
    </ScrollView>
  );
}

// ── Step 3: Location ──────────────────────────────────────────────────────────
function Step3({
  role, address, onAddress, coords, onCoords,
  locStatus, onLocStatus, onNext, onBack, isProvider,
}: any) {

  async function reverseGeocode(latitude: number, longitude: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {headers: {'Accept-Language': 'en', 'User-Agent': 'NeighBidApp/1.0'}},
      );
      if (res.ok) {
        const data = await res.json() as any;
        const a = data.address ?? {};
        const street = [a.house_number, a.road].filter(Boolean).join(' ');
        const neighborhoodName = a.suburb ?? a.neighbourhood ?? a.city_district ?? a.city ?? a.town ?? a.village ?? '';
        const cityName = a.city ?? a.county ?? '';
        const locality = [neighborhoodName, cityName]
          .filter((value, index, arr) => value && arr.indexOf(value) === index)
          .join(', ');
        const state = a.state ?? '';
        const postcode = a.postcode ?? '';
        const formatted = [street, locality, state, postcode].filter(Boolean).join(', ');
        const homeownerArea = locality || formatted;
        if (isProvider) {
          if (formatted) {onAddress(formatted);}
        } else if (homeownerArea) {
          onAddress(homeownerArea);
        }
      }
    } catch {}
  }

  function detectLocation() {
    onLocStatus('detecting');
    // Configure the package for iOS
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    });
    Geolocation.requestAuthorization();
    Geolocation.getCurrentPosition(
      async pos => {
        const {latitude, longitude} = pos.coords;
        onCoords({lat: latitude, lng: longitude});
        onLocStatus('detected');
        await reverseGeocode(latitude, longitude);
      },
      err => {
        console.warn('Geolocation error:', err.code, err.message);
        onLocStatus('denied');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }

  // Auto-trigger on mount
  useEffect(() => { detectLocation(); }, []);

  const stepTotal = isProvider ? 4 : 3;
  const region: Region = coords
    ? {
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }
    : WEST_ADAMS_REGION;

  return (
    <ScrollView contentContainerStyle={s.stepContent} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.stepEyebrow}>Step 3 of {stepTotal}</Text>
      <Text style={s.stepTitle}>{isProvider ? 'Set your base area' : 'Confirm your area'}</Text>
      <Text style={s.stepSub}>
        {isProvider
          ? 'Tell us where your business is based so we can show you nearby group jobs first.'
          : 'Tell us where you live so we can match you with neighbours within your 4-mile community.'}
      </Text>
      <StepDots current={3} total={stepTotal} />

      {/* Map */}
      <View style={s.mapPlaceholder}>
        {hasNativeMapView ? (
          <MapViewNative
            style={s.mapView}
            initialRegion={region}
            region={region}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
            showsCompass={false}
            showsScale={false}
            showsUserLocation={Boolean(coords)}
            showsMyLocationButton={false}>
            <MarkerNative coordinate={{latitude: region.latitude, longitude: region.longitude}}>
              <View style={s.mapMarker}>
                <MapPin size={22} color={colors.terracotta600} strokeWidth={2.4} fill={colors.terracotta50} />
              </View>
            </MarkerNative>
          </MapViewNative>
        ) : (
          <View style={s.mapFallback}>
            <View style={s.mapFallbackRoad} />
            <View style={[s.mapFallbackRoad, s.mapFallbackRoadAlt]} />
            <View style={s.mapMarker}>
              <MapPin size={28} color={colors.terracotta600} strokeWidth={2.2} fill={colors.terracotta50} />
            </View>
          </View>
        )}
        {locStatus === 'detected' && coords && (
          <View style={s.mapBadge}>
            <Text style={s.mapBadgeText}>📍 Location detected</Text>
          </View>
        )}
        {locStatus === 'detecting' && (
          <View style={s.mapBadge}>
            <ActivityIndicator size="small" color={colors.terracotta600} style={{marginRight: 6}} />
            <Text style={s.mapBadgeText}>Detecting location…</Text>
          </View>
        )}
      </View>

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>{isProvider ? 'BUSINESS BASE ADDRESS' : 'YOUR AREA'}</Text>
        <View style={s.inputRow}>
          <MapPin size={16} color={colors.ink400} strokeWidth={2} style={{marginRight: 8}} />
          <TextInput
            style={[s.input, {flex: 1}]}
            value={address}
            onChangeText={onAddress}
            placeholder={isProvider ? '123 Main St, West Adams, CA' : 'West Adams, Los Angeles'}
            placeholderTextColor={colors.ink300}
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Location status card */}
      <TouchableOpacity
        onPress={locStatus !== 'detected' ? detectLocation : undefined}
        activeOpacity={locStatus === 'detected' ? 1 : 0.7}
        style={[
          s.locCard,
          locStatus === 'detected' ? s.locCardGreen : locStatus === 'denied' ? s.locCardGrey : s.locCardOrange,
        ]}>
        {locStatus === 'detecting'
          ? <ActivityIndicator size="small" color={colors.terracotta600} style={{marginRight: 2}} />
          : locStatus === 'detected'
          ? <CheckCircle size={16} color={colors.sage700} strokeWidth={2.5} />
          : <Navigation size={16} color={colors.ink400} strokeWidth={2} />
        }
        <Text style={[s.locCardText, {flex: 1}, locStatus === 'detected' ? {color: colors.sage700} : locStatus === 'denied' ? {color: colors.ink500} : {color: colors.terracotta600}]}>
          {locStatus === 'detected'
            ? isProvider ? 'Base location set — nearby jobs will be ranked first.' : 'Location detected — neighbourhood matched.'
            : locStatus === 'detecting'
            ? 'Detecting your location…'
            : 'Location access denied. Tap to try again or type your address below.'}
        </Text>
        {locStatus !== 'detecting' && locStatus !== 'detected' && (
          <Text style={s.retryText}>Retry</Text>
        )}
      </TouchableOpacity>

      {/* Info card */}
      <View style={s.infoCard}>
        <Text style={s.infoTitle}>{isProvider ? 'Coverage note' : 'Residency requirement'}</Text>
        <Text style={s.infoBody}>
          {isProvider
            ? 'We\'ll rank jobs closest to this base area first, then expand by your service radius.'
            : '4-mile community radius. Must have lived 6+ months to join group bids.'}
        </Text>
      </View>

      <Button
        label={isProvider ? 'Continue' : 'Confirm my area'}
        onPress={onNext}
        style={s.submitBtn}
      />
    </ScrollView>
  );
}

// ── Step 4: Provider business setup ──────────────────────────────────────────
function Step4({data, onChange, onNext, onBack, submitting}: any) {
  const isComplete = data.companyName.trim() && data.serviceArea.trim() && data.services.length > 0;

  function toggleService(svc: string) {
    onChange('services',
      data.services.includes(svc)
        ? data.services.filter((s: string) => s !== svc)
        : [...data.services, svc],
    );
  }

  return (
    <ScrollView contentContainerStyle={s.stepContent} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.stepEyebrow}>Step 4 of 4</Text>
      <Text style={s.stepTitle}>Tell us about your business</Text>
      <Text style={s.stepSub}>Add your business name, services, and service area so homeowners can find you.</Text>
      <StepDots current={4} total={4} />

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>BUSINESS NAME</Text>
        <TextInput
          style={s.input}
          value={data.companyName}
          onChangeText={(v: string) => onChange('companyName', v)}
          placeholder="ProFix Plumbing LLC"
          placeholderTextColor={colors.ink300}
        />
      </View>

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>SERVICES OFFERED</Text>
        <View style={s.serviceGrid}>
          {SERVICE_OPTIONS.map(svc => {
            const selected = data.services.includes(svc);
            return (
              <TouchableOpacity
                key={svc}
                onPress={() => toggleService(svc)}
                style={[s.serviceChip, selected && s.serviceChipActive]}>
                <Text style={[s.serviceChipText, selected && s.serviceChipTextActive]}>{svc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>MAJOR SERVICE AREA</Text>
        <TextInput
          style={s.input}
          value={data.serviceArea}
          onChangeText={(v: string) => onChange('serviceArea', v)}
          placeholder="Los Angeles"
          placeholderTextColor={colors.ink300}
        />
      </View>

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>SERVICE RADIUS</Text>
        <View style={s.radiusRow}>
          {RADIUS_OPTIONS.map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => onChange('serviceRadius', r)}
              style={[s.radiusBtn, data.serviceRadius === r && s.radiusBtnActive]}>
              <Text style={[s.radiusBtnText, data.serviceRadius === r && s.radiusBtnTextActive]}>
                {r} mi
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.fieldWrap}>
        <Text style={s.fieldLabel}>ABOUT YOUR BUSINESS (optional)</Text>
        <TextInput
          style={[s.input, {height: 90, textAlignVertical: 'top', paddingTop: 12}]}
          value={data.bio}
          onChangeText={(v: string) => onChange('bio', v)}
          placeholder="Residential plumbing, emergency calls, water heater installs..."
          placeholderTextColor={colors.ink300}
          multiline
        />
      </View>

      <View style={s.toggleRow}>
        <View>
          <Text style={s.toggleLabel}>Licensed business</Text>
          <Text style={s.toggleSub}>Show homeowners your trade is credentialed</Text>
        </View>
        <Switch
          value={data.isLicensed}
          onValueChange={(v: boolean) => onChange('isLicensed', v)}
          trackColor={{true: colors.terracotta600, false: colors.border}}
        />
      </View>

      {data.isLicensed && (
        <View style={s.fieldWrap}>
          <Text style={s.fieldLabel}>LICENSE NUMBER</Text>
          <TextInput
            style={s.input}
            value={data.licenseNumber}
            onChangeText={(v: string) => onChange('licenseNumber', v)}
            placeholder="LIC-20491"
            placeholderTextColor={colors.ink300}
          />
        </View>
      )}

      <View style={s.toggleRow}>
        <View>
          <Text style={s.toggleLabel}>Insured business</Text>
          <Text style={s.toggleSub}>Surface jobs that prefer insured providers</Text>
        </View>
        <Switch
          value={data.isInsured}
          onValueChange={(v: boolean) => onChange('isInsured', v)}
          trackColor={{true: colors.terracotta600, false: colors.border}}
        />
      </View>

      <Button
        label={submitting ? 'Creating account…' : 'Finish provider setup'}
        onPress={onNext}
        disabled={!isComplete || submitting}
        loading={submitting}
        style={s.submitBtn}
      />
    </ScrollView>
  );
}

// ── Main RegisterScreen ───────────────────────────────────────────────────────
export default function RegisterScreen({navigation, onAuth}: Props) {
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>('homeowner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{lat: number; lng: number} | null>(null);
  const [locStatus, setLocStatus] = useState<'idle' | 'detecting' | 'detected' | 'denied'>('idle');
  const [interests, setInterests] = useState<string[]>([]);

  function toggleInterest(svc: string) {
    setInterests(prev =>
      prev.includes(svc) ? prev.filter(item => item !== svc) : [...prev, svc],
    );
  }

  const [business, setBusiness] = useState({
    companyName: '', bio: '', services: [] as string[],
    serviceArea: '', serviceRadius: 10, isLicensed: false,
    licenseNumber: '', isInsured: false,
  });
  const [community, setCommunity] = useState({
    communityName: '', communityType: '', communityAddress: '', unitCount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  function updateBusiness<K extends keyof typeof business>(key: K, value: typeof business[K]) {
    setBusiness(prev => ({...prev, [key]: value}));
  }

  function updateCommunity<K extends keyof typeof community>(key: K, value: typeof community[K]) {
    setCommunity(prev => ({...prev, [key]: value}));
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      if (role === 'admin') {
        const user = await registerHoa({
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          community_name: community.communityName.trim(),
          community_type: community.communityType,
          community_address: community.communityAddress.trim(),
          unit_count: community.unitCount ? parseInt(community.unitCount, 10) : undefined,
        });
        onAuth(user);
        return;
      }

      const user = await register({
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        latitude: coords?.lat,
        longitude: coords?.lng,
        service_interests: interests.length > 0 ? interests.join(',') : undefined,
      });

      if (role === 'provider') {
        await apiFetch('/provider/me', {
          method: 'PATCH',
          body: JSON.stringify({
            company_name: business.companyName,
            bio: business.bio,
            trades: business.services.join(', '),
            neighborhood: business.serviceArea,
            address,
            service_radius_mi: business.serviceRadius,
            is_licensed: business.isLicensed,
            is_insured: business.isInsured,
            license_number: business.isLicensed ? business.licenseNumber : null,
          }),
        });
      }

      onAuth(user);
    } catch (e: any) {
      Alert.alert('Registration failed', e.message ?? 'Try a different email.');
      setSubmitting(false);
    }
  }

  const stepContent = () => {
    if (step === 1) {
      return (
        <Step2
          role={role} onRole={setRole}
          onNext={() => setStep(2)}
          onBack={() => navigation.goBack()}
        />
      );
    }
    if (step === 2) {
      return (
        <Step1
          role={role}
          name={name} email={email} password={password} phone={phone}
          onName={setName} onEmail={setEmail} onPassword={setPassword} onPhone={setPhone}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      );
    }
    if (step === 3) {
      if (role === 'admin') {
        return (
          <Step3Admin
            data={community}
            onChange={updateCommunity}
            onNext={handleFinish}
            onBack={() => setStep(2)}
            submitting={submitting}
          />
        );
      }
      if (role === 'homeowner') {
        return (
          <Step3Interests
            interests={interests}
            onToggle={toggleInterest}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        );
      }
      // provider → location
      return (
        <Step3
          role={role} address={address} onAddress={setAddress}
          coords={coords} onCoords={setCoords}
          locStatus={locStatus} onLocStatus={setLocStatus}
          isProvider={true}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      );
    }
    if (step === 4) {
      if (role === 'homeowner') {
        return (
          <Step3
            role={role} address={address} onAddress={setAddress}
            coords={coords} onCoords={setCoords}
            locStatus={locStatus} onLocStatus={setLocStatus}
            isProvider={false}
            onNext={handleFinish}
            onBack={() => setStep(3)}
          />
        );
      }
      // provider → business setup
      return (
        <Step4
          data={business}
          onChange={updateBusiness}
          onNext={handleFinish}
          onBack={() => setStep(3)}
          submitting={submitting}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex}>
        {stepContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.bgApp},
  flex: {flex: 1},
  stepContent: {paddingHorizontal: 24, paddingBottom: 48},
  backBtn: {marginTop: 16, marginBottom: 20, alignSelf: 'flex-start'},
  backText: {color: colors.terracotta600, fontSize: 15, fontWeight: '600'},
  stepEyebrow: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 6},
  stepTitle: {fontSize: 32, fontWeight: '700', color: colors.ink900, letterSpacing: -0.6, marginBottom: 6},
  stepSub: {fontSize: 14, color: colors.ink500, lineHeight: 20, marginBottom: 20},
  fields: {marginTop: 20, gap: 16},
  fieldWrap: {marginTop: 16},
  fieldLabel: {fontSize: 11, fontWeight: '700', color: colors.ink400, letterSpacing: 1, marginBottom: 8},
  input: {
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, height: 50, paddingHorizontal: 16,
    fontSize: 15, color: colors.ink900,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, height: 50,
  },
  submitBtn: {marginTop: 28},
  interestHint: {fontSize: 13, color: colors.ink400, marginTop: 16, textAlign: 'center'},

  // Role cards
  roleCards: {gap: 12, marginTop: 20, marginBottom: 4},
  roleCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border, padding: 18,
  },
  roleCardActive: {borderColor: colors.terracotta600, backgroundColor: colors.terracotta50},
  roleCardTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6},
  roleCardTitle: {fontSize: 17, fontWeight: '700', color: colors.ink900},
  roleCardDesc: {fontSize: 13, color: colors.ink500, lineHeight: 18, marginBottom: 10},
  roleBadge: {
    alignSelf: 'flex-start', backgroundColor: colors.cream100,
    borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  roleBadgeText: {fontSize: 11, fontWeight: '700', color: colors.ink500},

  // Map
  mapPlaceholder: {
    height: 160, borderRadius: 20, backgroundColor: colors.cream100,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  mapView: {flex: 1},
  mapFallback: {
    flex: 1,
    backgroundColor: colors.cream100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapFallbackRoad: {
    position: 'absolute',
    width: '130%',
    height: 46,
    backgroundColor: 'rgba(255,255,255,0.38)',
    transform: [{rotate: '26deg'}],
  },
  mapFallbackRoadAlt: {
    width: '120%',
    height: 34,
    backgroundColor: 'rgba(237,228,211,0.9)',
    transform: [{rotate: '-18deg'}],
  },
  mapMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  mapBadge: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  mapBadgeText: {fontSize: 11, fontWeight: '600', color: colors.ink700},

  // Location status
  locCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: radius.md, borderWidth: 1, padding: 12, marginTop: 12,
  },
  locCardGreen: {backgroundColor: colors.sage50, borderColor: colors.sage100},
  locCardGrey: {backgroundColor: colors.cream100, borderColor: colors.border},
  locCardOrange: {backgroundColor: colors.terracotta50, borderColor: colors.terracotta100},
  locCardText: {fontSize: 13, lineHeight: 18},
  retryText: {fontSize: 12, fontWeight: '700', color: colors.terracotta600, marginLeft: 4},
  infoCard: {
    backgroundColor: colors.cream100, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 10,
  },
  infoTitle: {fontSize: 13, fontWeight: '700', color: colors.ink900, marginBottom: 3},
  infoBody: {fontSize: 12, color: colors.ink500, lineHeight: 16},

  // Provider step 4
  serviceGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4},
  serviceChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: colors.cream100, borderWidth: 1, borderColor: colors.border,
  },
  serviceChipActive: {backgroundColor: colors.terracotta600, borderColor: colors.terracotta600},
  serviceChipText: {fontSize: 13, fontWeight: '600', color: colors.ink700},
  serviceChipTextActive: {color: '#fff'},
  radiusRow: {flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap'},
  radiusBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill,
    backgroundColor: colors.cream100, borderWidth: 1, borderColor: colors.border,
  },
  radiusBtnActive: {backgroundColor: colors.terracotta600, borderColor: colors.terracotta600},
  radiusBtnText: {fontSize: 13, fontWeight: '600', color: colors.ink700},
  radiusBtnTextActive: {color: '#fff'},
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border,
  },
  toggleLabel: {fontSize: 15, fontWeight: '600', color: colors.ink900},
  toggleSub: {fontSize: 12, color: colors.ink400, marginTop: 2},
});
