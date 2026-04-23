import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Modal, ScrollView, KeyboardAvoidingView, Platform,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Camera, ImageIcon, X } from 'lucide-react-native';
import { useBeerStore } from '@/lib/beerStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BeerFormProps {
  visible: boolean;
  onClose: () => void;
}

async function scheduleReminder(beerId: string, name: string, brewery: string, date: Date): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to open a beer! 🍺',
      body: `${name} from ${brewery} is ready to enjoy.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
  return id;
}

export default function BeerForm({ visible, onClose }: BeerFormProps) {
  const { createBeer, setNotificationId } = useBeerStore();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    name: '', brewery: '', style: '', abv: '', ibu: '',
    volume: '', purchaseValue: '', purchaseLocation: '',
    description: '', rating: '', notes: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [reminderDate, setReminderDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const setField = (key: string) => (val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Allow photo library access.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Allow camera access.'); return; }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const reset = () => {
    setFormData({ name: '', brewery: '', style: '', abv: '', ibu: '', volume: '', purchaseValue: '', purchaseLocation: '', description: '', rating: '', notes: '' });
    setImageUri(null);
    setReminderDate('');
    setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError('');
    if (!formData.name || !formData.brewery) { setError(t('form.requiredNameBrewery')); return; }
    setIsLoading(true);
    try {
      const beerData: Record<string, string | number> = {
        name: formData.name,
        brewery: formData.brewery,
        ...(formData.style && { style: formData.style }),
        ...(formData.abv && { abv: parseFloat(formData.abv) }),
        ...(formData.ibu && { ibu: parseInt(formData.ibu) }),
        ...(formData.volume && { volume: formData.volume }),
        ...(formData.purchaseValue && { purchaseValue: parseFloat(formData.purchaseValue) }),
        ...(formData.purchaseLocation && { purchaseLocation: formData.purchaseLocation }),
        ...(formData.description && { description: formData.description }),
        ...(formData.rating && { rating: parseFloat(formData.rating) }),
        ...(formData.notes && { notes: formData.notes }),
        ...(imageUri && { imageUrl: imageUri }),
        ...(reminderDate && { consumptionReminderDate: new Date(reminderDate).toISOString() }),
      };

      const beer = await createBeer(beerData);

      if (reminderDate) {
        const date = new Date(reminderDate);
        if (date > new Date()) {
          const notifId = await scheduleReminder(beer.id, beer.name, beer.brewery, date);
          if (notifId) setNotificationId(beer.id, notifId);
        }
      }

      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create beer');
    } finally {
      setIsLoading(false);
    }
  };

  const Field = ({ label, fieldKey, placeholder, keyboardType, multiline }: {
    label: string; fieldKey: keyof typeof formData;
    placeholder?: string; keyboardType?: 'numeric' | 'default';
    multiline?: boolean;
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.fgMuted }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.fg },
          multiline && { height: 72, textAlignVertical: 'top' },
        ]}
        value={formData[fieldKey]}
        onChangeText={setField(fieldKey)}
        placeholder={placeholder}
        placeholderTextColor={colors.fgMuted + '80'}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
      />
    </View>
  );

  const SectionLabel = ({ text }: { text: string }) => (
    <Text style={[styles.sectionLabel, { color: colors.fgMuted, borderBottomColor: colors.border }]}>
      {text}
    </Text>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top || 20 }]}>
        {/* Modal header */}
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.fg }]}>{t('form.title')}</Text>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <X size={20} color={colors.fgMuted} />
          </Pressable>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerDim, borderColor: colors.danger + '50' }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            )}

            <SectionLabel text="Core" />
            <Field label={`${t('form.name')} *`} fieldKey="name" />
            <Field label={`${t('form.brewery')} *`} fieldKey="brewery" />
            <Field label={t('form.style')} fieldKey="style" placeholder="IPA, Stout, Lager…" />
            <Field label={t('form.volume')} fieldKey="volume" placeholder="500ml, 12oz…" />

            <SectionLabel text="Technical" />
            <Field label={t('form.abv')} fieldKey="abv" placeholder="5.5" keyboardType="numeric" />
            <Field label={t('form.ibu')} fieldKey="ibu" placeholder="40" keyboardType="numeric" />

            <SectionLabel text="Purchase" />
            <Field label={t('form.purchaseValue')} fieldKey="purchaseValue" placeholder="0.00" keyboardType="numeric" />
            <Field label={t('form.purchaseLocation')} fieldKey="purchaseLocation" placeholder="Store, city…" />

            <SectionLabel text="Reminder" />
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.fgMuted }]}>{t('form.reminderDate')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.fg }]}
                value={reminderDate}
                onChangeText={setReminderDate}
                placeholder="YYYY-MM-DD HH:MM"
                placeholderTextColor={colors.fgMuted + '80'}
              />
            </View>

            <SectionLabel text="Notes" />
            <Field label={t('form.description')} fieldKey="description" multiline />
            <Field label="Rating (0–5)" fieldKey="rating" placeholder="4.2" keyboardType="numeric" />

            <SectionLabel text="Photo" />
            <View style={styles.photoRow}>
              <Pressable
                style={({ pressed }) => [styles.photoBtn, {
                  backgroundColor: colors.accentDim,
                  borderColor: colors.accent + '50',
                  opacity: pressed ? 0.75 : 1,
                }]}
                onPress={takePhoto}
              >
                <Camera size={16} color={colors.accent} />
                <Text style={[styles.photoBtnText, { color: colors.accent }]}>{t('form.photo')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.photoBtn, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                }]}
                onPress={pickFromGallery}
              >
                <ImageIcon size={16} color={colors.fgMuted} />
                <Text style={[styles.photoBtnText, { color: colors.fgMuted }]}>{t('form.gallery')}</Text>
              </Pressable>
            </View>
            {imageUri && (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                <Pressable style={styles.removePhoto} onPress={() => setImageUri(null)}>
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            )}

            <View style={styles.buttons}>
              <Pressable
                style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 }]}
                onPress={handleSubmit} disabled={isLoading}
              >
                {isLoading
                  ? <ActivityIndicator color={colors.accentFg} />
                  : <Text style={[styles.submitText, { color: colors.accentFg }]}>{t('form.addBeer')}</Text>}
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, { borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelText, { color: colors.fg }]}>{t('form.cancel')}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  modalTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20 },
  closeBtn: { padding: 4 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  fieldWrap: { marginBottom: 12 },
  label: { fontFamily: 'DMSans_500Medium', fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  input: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    fontFamily: 'DMSans_400Regular', fontSize: 14,
  },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold', fontSize: 9, letterSpacing: 1.8, textTransform: 'uppercase',
    marginTop: 20, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1,
  },
  errorBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontFamily: 'DMSans_400Regular', fontSize: 13 },
  photoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 12,
  },
  photoBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  previewWrap: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  preview: { width: '100%', height: 180 },
  removePhoto: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 99,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
  },
  buttons: { gap: 10, marginTop: 24 },
  submitBtn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  submitText: { fontFamily: 'DMSans_700Bold', fontSize: 15 },
  cancelBtn: { borderRadius: 12, paddingVertical: 15, alignItems: 'center', borderWidth: 1 },
  cancelText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15 },
});
