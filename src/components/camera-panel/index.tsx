import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Colors } from '@/constants/colors';
import { Icon } from '@/components/icon';

interface CameraPanelProps {
  onPhoto: (uri: string) => void;
  onClose: () => void;
  height?: number;
}

// Câmera ao vivo dentro do app (celular e webcam no navegador).
// No navegador a câmera só funciona em HTTPS ou em "localhost".
export function CameraPanel({ onPhoto, onClose, height = 380 }: CameraPanelProps) {
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const permissionRequested = useRef(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pede a permissão uma única vez ao abrir
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && !permissionRequested.current) {
      permissionRequested.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission]);

  async function takePhoto() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const photo = await camera.current?.takePictureAsync({ quality: 0.7 });
      if (!photo?.uri) throw new Error('sem foto');
      onPhoto(photo.uri);
    } catch {
      setError('Não foi possível fotografar. Tente novamente ou escolha uma imagem da galeria.');
    } finally {
      setBusy(false);
    }
  }

  if (!permission) {
    return (
      <View style={[styles.fallback, { height }]}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.fallbackText}>Verificando câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.fallback, { height }]}>
        <Icon name="camera-outline" size={36} color={Colors.primary} />
        <Text style={styles.fallbackTitle}>Câmera indisponível</Text>
        <Text style={styles.fallbackText}>
          Autorize o acesso à câmera nas configurações do aparelho ou do navegador para fotografar.
        </Text>
        {permission.canAskAgain && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => void requestPermission()}>
            <Text style={styles.primaryBtnText}>Permitir câmera</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.ghostBtn} onPress={onClose}>
          <Text style={styles.ghostBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <CameraView
        ref={camera}
        facing={facing}
        style={StyleSheet.absoluteFill}
        onCameraReady={() => setReady(true)}
        onMountError={() => setError('A câmera não pôde ser iniciada neste aparelho ou navegador.')}
      />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.roundBtn} onPress={onClose} accessibilityLabel="Fechar câmera">
          <Icon name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={() => {
            setReady(false);
            setFacing((f) => (f === 'back' ? 'front' : 'back'));
          }}
          accessibilityLabel="Virar câmera"
        >
          <Icon name="camera-reverse-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.hint}>
          {error ?? (ready ? 'Enquadre o jogador e toque para fotografar' : 'Iniciando câmera...')}
        </Text>
        <TouchableOpacity
          style={[styles.shutter, (!ready || busy) && { opacity: 0.5 }]}
          disabled={!ready || busy}
          onPress={() => void takePhoto()}
          accessibilityLabel="Tirar foto"
        >
          <View style={styles.shutterInner}>{busy && <ActivityIndicator color={Colors.background} />}</View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: 12,
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 120,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: 12,
  },
  hint: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 14,
  },
  shutter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  shutterInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
    marginBottom: 12,
  },
  fallbackTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  fallbackText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ghostBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  ghostBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
