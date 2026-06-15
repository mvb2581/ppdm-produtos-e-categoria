import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../../api/api';

export default function CategoriaScreenEditar() {
  const route = useRoute();
  const navigation = useNavigation();

  const [nomeCategoria, setNomeCategoria] = useState('');
  const [idCategoria, setIdCategoria] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params) {
      setIdCategoria(route.params.Id)
      setNomeCategoria(route.params.Nome);
    }
  }, [route.params]);

  async function salvar() {
    if (!nomeCategoria || nomeCategoria.trim().length < 3) {
      Alert.alert('Atencão', 'Informe corretamente o nome da categoria');
      return
    }

    if (!idCategoria || idCategoria <= 0) {
      Alert.alert('Atencão', 'Verifique o ID da categoria');
      return
    }

    setLoading(true);
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      await Promise.race([
        api.put(`/categorias/${idCategoria}`, { nome: nomeCategoria, descricao: ' ', id: idCategoria }),
        timeout
      ]);
      navigation.goBack();
    } catch (error) {
      console.log(error);
      if (error.message === 'Timeout') {
        Alert.alert('Erro', 'Tempo limite excedido. Verifique o servidor.');
      } else if (error.response) {
        Alert.alert('Erro', `Servidor retornou: ${error.response.status}`);
      } else if (error.request) {
        Alert.alert('Erro', 'Servidor não respondeu. Verifique a conexão.');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar a categoria.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar Categoria</Text>
      <StatusBar style="auto" />

      <TextInput
        value={idCategoria ? String(idCategoria) : ''}
        onChangeText={(text) => setIdCategoria(Number(text))}
        style={styles.input}
      />

      <TextInput
        placeholder="Digite o nome da categoria"
        value={nomeCategoria}
        onChangeText={setNomeCategoria}
        style={styles.input}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={salvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: "#fff" }}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  titulo: {
    marginTop: 25,
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    width: '95%'
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
});
