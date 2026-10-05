import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/icon';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { showCustomAlert } from '@/components/alert';
import { saveMatch } from '@/integration/matchStorage';

const POSITIONS = ['Atacante', 'Meio-Campo', 'Lateral', 'Zagueiro', 'Goleiro'];

export default function NewMatchScreen() {
  const router = useRouter();

  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('Atacante');
  const [goals, setGoals] = useState(1);
  const [assists, setAssists] = useState(0);
  const [yellowCards, setYellowCards] = useState(0);
  const [rating, setRating] = useState(8.0);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // GPS State
  const [locationName, setLocationName] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Câmera NATIVA
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showCustomAlert('Permissão necessária', 'Permita o acesso à câmera para tirar a foto do jogador.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      showCustomAlert('Erro', 'Não foi possível acionar a câmera.');
    }
  };

  // Galeria
  const handlePickGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showCustomAlert('Permissão necessária', 'Permita o acesso à galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      showCustomAlert('Erro', 'Não foi possível selecionar da galeria.');
    }
  };

  // GPS / Localização NATIVA com Geocodificação Completa
  const handleGetLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showCustomAlert('Permissão negada', 'Permita o acesso à localização para capturar o local do jogo.');
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      // Geocodificação reversa
      const addresses = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const item = addresses[0];

        // Monta o nome completo da rua, número e bairro
        const street = item.street || item.formattedAddress?.split(',')[0] || (item.name && isNaN(Number(item.name)) ? item.name : '');
        const number = item.streetNumber || (!isNaN(Number(item.name)) ? item.name : '');
        const district = item.district || item.subregion || '';

        let fullStreet = street;
        if (fullStreet && number) {
          fullStreet += `, ${number}`;
        } else if (!fullStreet && number) {
          fullStreet = `Nº ${number}`;
        }
        if (district && fullStreet) {
          fullStreet += ` - ${district}`;
        }

        const city = item.city || item.subregion || '';
        const state = item.region || '';
        const fullCity = [city, state].filter(Boolean).join(' - ');

        setLocationName(fullStreet || 'Campo de Futebol');
        setLocationCity(fullCity || 'Localização Atual');
      } else {
        setLocationName('Campo / Quadra de Futebol');
        setLocationCity(`Lat: ${loc.coords.latitude.toFixed(4)}, Long: ${loc.coords.longitude.toFixed(4)}`);
      }

      showCustomAlert('GPS Conectado', 'Endereço e coordenadas obtidos com sucesso!');
    } catch (error) {
      showCustomAlert('Erro de GPS', 'Não foi possível capturar a localização atual.');
    } finally {
      setIsLocating(false);
    }
  };

  // Salvar no Banco JSON
  const handleSave = async () => {
    if (!playerName.trim()) {
      showCustomAlert('Atenção', 'Por favor, informe o nome do jogador.');
      return;
    }

    setIsSaving(true);
    try {
      await saveMatch({
        playerName: playerName.trim(),
        position,
        goals,
        assists,
        yellowCards,
        rating,
        photoUri,
        location: {
          addressName: locationName || 'Campo / Quadra Local',
          city: locationCity || 'Local não informado',
          latitude,
          longitude,
        },
        notes: notes.trim(),
      });

      showCustomAlert('Sucesso!', 'Dados do jogador registrados no banco de dados JSON!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      showCustomAlert('Erro', 'Não foi possível salvar os dados.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>Registrar Craque da Partida</Text>
              <Text style={styles.subtitle}>Foto, GPS e estatísticas da partida</Text>
            </View>
          </View>

          {/* Seção 1: Foto do Jogador */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📸 Foto do Jogador</Text>
            
            {photoUri ? (
              <View style={styles.photoWrapper}>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photo}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setPhotoUri(null)}
                >
                  <Icon name="close-circle" size={34} color={Colors.danger} />
                </TouchableOpacity>
                <View style={styles.photoTag}>
                  <Text style={styles.photoTagText}>✓ Foto Carregada</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noPhotoBox}>
                <Icon name="camera-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.noPhotoText}>Nenhuma foto selecionada ainda</Text>
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.photoActionBtn, styles.btnGreen]} onPress={handleTakePhoto}>
                <Icon name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.photoBtnText}>Tirar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.photoActionBtn, styles.btnDark]} onPress={handlePickGallery}>
                <Icon name="images" size={18} color={Colors.text} />
                <Text style={[styles.photoBtnText, { color: Colors.text }]}>Galeria</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Seção 2: Informações Básicas */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>👤 Informações do Atleta</Text>
            
            <Input
              label="Nome do Jogador"
              placeholder="Ex: Gabriel Jesus"
              icon="person-outline"
              value={playerName}
              onChangeText={setPlayerName}
            />

            <Text style={styles.fieldLabel}>Posição em Campo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.posList}>
              {POSITIONS.map((pos) => (
                <TouchableOpacity
                  key={pos}
                  style={[styles.posChip, position === pos && styles.posChipActive]}
                  onPress={() => setPosition(pos)}
                >
                  <Text style={[styles.posText, position === pos && styles.posTextActive]}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Seção 3: Estatísticas da Partida */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>⚽ Estatísticas da Partida</Text>

            {/* Gols */}
            <View style={styles.counterRow}>
              <View style={styles.counterInfo}>
                <Text style={styles.counterTitle}>⚽ Gols Marcados</Text>
                <Text style={styles.counterDesc}>Total de gols no jogo</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setGoals(Math.max(0, goals - 1))}
                >
                  <Icon name="remove" size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{goals}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setGoals(goals + 1)}
                >
                  <Icon name="add" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Assistências */}
            <View style={styles.counterRow}>
              <View style={styles.counterInfo}>
                <Text style={styles.counterTitle}>🎯 Assistências</Text>
                <Text style={styles.counterDesc}>Passes para gol</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setAssists(Math.max(0, assists - 1))}
                >
                  <Icon name="remove" size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{assists}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setAssists(assists + 1)}
                >
                  <Icon name="add" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Cartões */}
            <View style={styles.counterRow}>
              <View style={styles.counterInfo}>
                <Text style={styles.counterTitle}>🟨 Cartões Amarelos</Text>
                <Text style={styles.counterDesc}>Advertências</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setYellowCards(Math.max(0, yellowCards - 1))}
                >
                  <Icon name="remove" size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{yellowCards}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => setYellowCards(yellowCards + 1)}
                >
                  <Icon name="add" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nota */}
            <View style={styles.ratingRow}>
              <Text style={styles.counterTitle}>⭐ Nota da Partida: {rating.toFixed(1)}</Text>
              <View style={styles.ratingBtns}>
                {[6, 7, 8, 9, 10].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.ratingBtn, Math.round(rating) === num && styles.ratingBtnActive]}
                    onPress={() => setRating(num)}
                  >
                    <Text style={[styles.ratingText, Math.round(rating) === num && styles.ratingTextActive]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Seção 4: Localização GPS NATIVA */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📍 Localização do Campo (GPS)</Text>
            
            <View style={styles.locationDisplay}>
              <Icon name="location-sharp" size={24} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.locNameText}>
                  {locationName || 'Nenhuma localização registrada'}
                </Text>
                <Text style={styles.locCityText}>
                  {locationCity || 'Clique no botão abaixo para capturar via GPS'}
                </Text>
              </View>
            </View>

            <Button
              title={isLocating ? 'Obtendo Endereço e Coordenadas...' : 'Obter Localização Atual (GPS)'}
              variant="secondary"
              isLoading={isLocating}
              onPress={handleGetLocation}
            />
          </View>

          {/* Observações */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📝 Observações da Partida</Text>
            <Input
              placeholder="Ex: Jogou muito bem no segundo tempo..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Botão Salvar Registro */}
          <Button
            title="💾 Salvar Dados do Jogador"
            isLoading={isSaving}
            onPress={handleSave}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 650,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  photoWrapper: {
    position: 'relative',
    width: '100%',
    height: 240,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#000000',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 18,
  },
  photoTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  noPhotoBox: {
    height: 140,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: 14,
  },
  noPhotoText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnGreen: {
    backgroundColor: Colors.primary,
  },
  btnDark: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  posList: {
    gap: 8,
    marginBottom: 6,
  },
  posChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  posChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  posText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  posTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  counterInfo: {
    flex: 1,
  },
  counterTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  counterDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
  },
  ratingRow: {
    paddingTop: 12,
  },
  ratingBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  ratingBtn: {
    width: 48,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  ratingTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  locNameText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  locCityText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  saveBtn: {
    marginTop: 10,
    height: 54,
  },
});
