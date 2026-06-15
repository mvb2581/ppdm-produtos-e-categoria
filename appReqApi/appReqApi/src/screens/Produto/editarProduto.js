import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../../api/api';

export default function ProdutoScreenEditar() {
  const route = useRoute();
  const navigation = useNavigation();

  const [nomeProduto, setNomeProduto] = useState('');
  const [valorProduto, setValorProduto] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);
  const [idProduto, setIdProduto] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params) {
      setIdProduto(route.params.Id);
      setNomeProduto(route.params.NomeProduto);
      setValorProduto(String(route.params.Valor));
      setCategoriaId(route.params.CategoriaId);
    }
  }, [route.params]);

  useEffect(() => {
    try {
      const setup = async () => {
        const response = await api.get('/categorias');
        setCategorias(response.data.result || []);
      }
      setup();
    } catch (error) {
      console.log(error);
      Alert.alert('Ocorreu um erro');
    }
  }, []);

  async function salvar() {
    if (!nomeProduto || nomeProduto.trim().length < 3) {
      Alert.alert('Atencão', 'Informe corretamente o nome do produto');
      return
    }

    if (!categoriaId) {
      Alert.alert('Atenção', 'Selecione uma categoria');
      return
    }

    const valor = parseFloat(valorProduto);

    if (!valorProduto || isNaN(valor) || valor <= 0) {
      Alert.alert('Atenção', 'Informe um valor');
      return;
    }

    if (!idProduto || idProduto <= 0) {
      Alert.alert('Atencão', 'Verifique o ID do produto');
      return
    }

    setLoading(true);
    const body = { nome: nomeProduto, valor: Number(valor), idCategoria: Number(categoriaId), id: Number(idProduto) };
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      await Promise.race([
        api.put(`/produtos/${idProduto}`, body),
        timeout
      ]);
      navigation.goBack();
    } catch (error) {
      console.log(error);
      if (error.message === 'Timeout') {
        Alert.alert('Erro', 'Tempo limite excedido. Verifique o servidor.');
      } else if (error.response) {
        const msg = error.response.data?.mensagem || error.response.data?.message || JSON.stringify(error.response.data);
        Alert.alert(`Erro ${error.response.status}`, msg);
        console.log(error.response.data);
      } else if (error.request) {
        Alert.alert('Erro', 'Servidor não respondeu. Verifique a conexão.');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o produto.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar Produto</Text>
      <StatusBar style="auto" />

      <TextInput
        placeholder="Digite o nome do produto"
        value={nomeProduto}
        onChangeText={setNomeProduto}
        style={styles.input}
      />

      <TextInput
        placeholder="Digite valor do produto"
        value={valorProduto}
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9.]/g, '');
          const parts = cleaned.split('.');
          if (parts.length > 2) return;
          setValorProduto(cleaned);
        }}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoriaId}
          onValueChange={(itemValue) => setCategoriaId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label='Selecione uma categoria' value={null} />
          {categorias.map((cat) => (
            <Picker.Item
              key={cat.Id}
              label={cat.Nome}
              value={cat.Id}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textButton}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={salvar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.textButton, { color: '#fff' }]}>Salvar</Text>
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
    fontSize: 16,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    width: '95%',
    height: 50
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '95%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    width: '48%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  pickerContainer: {
    width: '95%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
  },
  picker: {
  },
  textButton: {
    fontSize: 16
  }
});
