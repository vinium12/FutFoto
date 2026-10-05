import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/icon';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { showCustomAlert } from '@/components/alert';
import { saveMatch } from '@/integration/matchStorage';

const POSITIONS = ['Atacante', 'Meio-Campo', 'Lateral', 'Zagueiro', 'Goleiro'];
const COMMON_LOCATIONS = [
  { name: 'Arena Soccer Society', city: 'São Paulo - SP' },
  { name: 'Complexo Esportivo FutShow', city: 'Campinas - SP' },
  { name: 'Centro de Treinamento Gol de Placa', city: 'Santos - SP' },
  { name: 'Quadra Society Central', city: 'São José dos Campos - SP' },
];

export default function NewMatchWeb() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('Atacante');
  const [goals, setGoals] = useState(1);
  const [assists, setAssists] = useState(0);
  const [yellowCards, setYellowCards] = useState(0);
  const [rating, setRating] = useState(8.0);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Localização Manual Web
  const [locationName, setLocationName] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Upload de Imagem do Computador / Área de Trabalho (Web)
  const handleFileUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoUri(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPredefinedLocation = (loc: { name: string; city: string }) => {
    setLocationName(loc.name);
    setLocationCity(loc.city);
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
          addressName: locationName || 'Campo Local (Web)',
          city: locationCity || 'Cidade não especificada',
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
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header Web */}
          <div style={{ display: 'none' }}>
            <input
              type="file"
              accept="image/*"
              // @ts-ignore
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>

          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>Registrar Craque da Partida (Web / Desktop)</Text>
              <Text style={styles.subtitle}>Anexe fotos do computador e preencha as estatísticas da partida</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {/* Coluna Esquerda: Foto e Local */}
            <View style={styles.column}>
              {/* Seção 1: Upload de Foto da Área de Trabalho */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>🖼️ Foto do Jogador (Área de Trabalho / PC)</Text>

                {photoUri ? (
                  <View style={styles.photoWrapper}>
                    <Image
                      source={{ uri: photoUri }}
                      style={styles.photo}
                      contentFit="cover"
                      transition={200}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => setPhotoUri(null)}
                    >
                      <Icon name="close-circle" size={30} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadDropzone}
                    onPress={() => fileInputRef.current?.click()}
                  >
                    <Icon name="cloud-upload-outline" size={48} color={Colors.primary} />
                    <Text style={styles.uploadTitle}>Clique para Anexar Imagem do PC</Text>
                    <Text style={styles.uploadSubtitle}>PNG, JPG ou WEBP da sua Área de Trabalho</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => fileInputRef.current?.click()}
                >
                  <Icon name="folder-open-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.browseBtnText}>
                    {photoUri ? 'Trocar Imagem do Computador' : 'Procurar no Computador...'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Seção 2: Local da Partida (Manual Desktop) */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>🏟️ Local da Partida / Estádio</Text>
                <Input
                  label="Nome do Campo / Arena"
                  placeholder="Ex: Arena Soccer Society"
                  icon="business-outline"
                  value={locationName}
                  onChangeText={setLocationName}
                />
                <Input
                  label="Cidade / Estado"
                  placeholder="Ex: São Paulo - SP"
                  icon="location-outline"
                  value={locationCity}
                  onChangeText={setLocationCity}
                />

                <Text style={styles.quickLocLabel}>Sugestões Rápidas:</Text>
                <View style={styles.quickLocGrid}>
                  {COMMON_LOCATIONS.map((loc, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.quickLocBtn}
                      onPress={() => handleSelectPredefinedLocation(loc)}
                    >
                      <Text style={styles.quickLocText}>{loc.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Coluna Direita: Dados do Atleta e Estatísticas */}
            <View style={styles.column}>
              {/* Informações Básicas */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>👤 Informações do Atleta</Text>

                <Input
                  label="Nome Completo do Jogador"
                  placeholder="Ex: Vinícius Júnior"
                  icon="person-outline"
                  value={playerName}
                  onChangeText={setPlayerName}
                />

                <Text style={styles.fieldLabel}>Posição Tática</Text>
                <View style={styles.posGrid}>
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
                </View>
              </View>

              {/* Estatísticas */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>⚽ Estatísticas da Partida</Text>

                {/* Gols */}
                <View style={styles.counterRow}>
                  <View>
                    <Text style={styles.counterTitle}>⚽ Gols Marcados</Text>
                    <Text style={styles.counterDesc}>Gols na partida</Text>
                  </View>
                  <View style={styles.counterControls}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setGoals(Math.max(0, goals - 1))}
                    >
                      <Icon name="remove" size={18} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{goals}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setGoals(goals + 1)}
                    >
                      <Icon name="add" size={18} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Assistências */}
                <View style={styles.counterRow}>
                  <View>
                    <Text style={styles.counterTitle}>🎯 Assistências</Text>
                    <Text style={styles.counterDesc}>Passes para gol</Text>
                  </View>
                  <View style={styles.counterControls}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setAssists(Math.max(0, assists - 1))}
                    >
                      <Icon name="remove" size={18} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{assists}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setAssists(assists + 1)}
                    >
                      <Icon name="add" size={18} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Cartões */}
                <View style={styles.counterRow}>
                  <View>
                    <Text style={styles.counterTitle}>🟨 Cartões Amarelos</Text>
                    <Text style={styles.counterDesc}>Advertências</Text>
                  </View>
                  <View style={styles.counterControls}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setYellowCards(Math.max(0, yellowCards - 1))}
                    >
                      <Icon name="remove" size={18} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{yellowCards}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setYellowCards(yellowCards + 1)}
                    >
                      <Icon name="add" size={18} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Nota */}
                <View style={styles.ratingRow}>
                  <Text style={styles.counterTitle}>⭐ Nota da Atuação: {rating.toFixed(1)}</Text>
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

              {/* Observações */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>📝 Observações da Súmula</Text>
                <Input
                  placeholder="Comentários sobre a partida..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Salvar */}
              <Button
                title="💾 Salvar Dados no Banco JSON"
                isLoading={isSaving}
                onPress={handleSave}
                style={{ height: 52 }}
              />
            </View>
          </View>
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
    padding: 24,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    cursor: 'pointer',
  } as any,
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: 340,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  uploadDropzone: {
    height: 180,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: 12,
  } as any,
  uploadTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  uploadSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  browseBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 42,
    borderRadius: 10,
    cursor: 'pointer',
  } as any,
  browseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  photoWrapper: {
    position: 'relative',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    cursor: 'pointer',
  } as any,
  quickLocLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 6,
  },
  quickLocGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickLocBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    cursor: 'pointer',
  } as any,
  quickLocText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  posGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  posChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    cursor: 'pointer',
  } as any,
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
  counterTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  counterDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    cursor: 'pointer',
  } as any,
  counterValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  ratingRow: {
    paddingTop: 12,
  },
  ratingBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingBtn: {
    width: 44,
    height: 36,
    borderRadius: 6,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    cursor: 'pointer',
  } as any,
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
});
