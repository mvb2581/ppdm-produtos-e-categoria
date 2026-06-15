// Importa a barra de status do Expo
import { StatusBar } from 'expo-status-bar';

// Hooks do React para estado, efeitos e memorização de funções
import { useState, useEffect, useCallback } from 'react';

// Componentes básicos de interface do React Native
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';

// Hooks de navegação entre telas
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';

export default function ProdutoScreen() {
  const navigation = useNavigation();

  const [produtos, setProdutos] = useState([]);

  // Executa ao montar o componente (uma única vez)
  useEffect(() => {
    try {
      const setup = async () => {
        // Carrega os dados iniciais
        await loadData();
      }
      setup();
    } catch (error) {
      console.log(error);
      Alert.alert('Ocorreu um erro');
    }
  }, []);

  // Executa sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      async function load() {
        await loadData(); // Atualiza a lista ao voltar para a tela
      }
      load();
    }, [])
  );

  async function loadData() {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data.result);
    } catch (error) {
      console.log(error);
      Alert.alert('Ocorreu um erro', error.message);
    }
  }

  async function openEdit(item) {
    try {
      if (!item) {
        Alert.alert('Atenção', 'Selecione um produto para editar');
        return;
      }
      navigation.navigate('ProdutoScreenEditar', item);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDelete(id) {
    Alert.alert('Confirmação', 'Deseja realmente excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/produtos/${id}`);
              await loadData();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o produto.');
            }
          }
        }
      ]
    );
  }

  // Renderização da tela
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Cabeçalho da tela */}
      <View style={styles.header}>
        <Text style={styles.titleScreen}>Gestão de produtos</Text>

        {/* Botão para adicionar novo produto */}
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ProdutoScreenIncluir')}>
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de produtos */}
      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.Id)} // Define chave única
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>

            {/* Barra lateral decorativa */}
            <View style={styles.sideBar} />

            <View style={styles.conteudo}>

              <View style={styles.cardInner}>
                <View style={styles.cardContent}>
                  {/* Exibição dos dados do produto */}
                  <Text style={styles.title}>ID: {item.Id}</Text>
                  <Text style={styles.title}>Produto: {item.NomeProduto}</Text>
                  <Text style={styles.title}>Valor R$: {item.Valor}</Text>
                  <Text style={styles.title}>Categoria: {item.NomeCategoria}</Text>
                </View>
              </View>

              {/* Área de ações */}
              <View style={styles.actions}>

                {/* Botão de editar */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#E3F2FD" }]}
                  onPress={() => openEdit(item)}
                >
                  <Text style={styles.iconText}>✏️ Editar</Text>
                </TouchableOpacity>

                {/* Botão de excluir */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#FFEBEE" }]}
                  onPress={() => handleDelete(item.Id)}
                >
                  <Text style={styles.iconText}>🗑️ Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        )}
      />
    </View>
  );
}

// Estilos da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Barra lateral laranja decorativa
  sideBar: {
    width: 6,
    backgroundColor: "#FF9800",
  },

  conteudo: {
    flex: 1,
    padding: 5,
    flexDirection: 'column',
  },

  cardInner: {
    flex: 1,
    padding: 16,
  },

  // Cabeçalho da tela
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  titleScreen: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },

  // Botão de adicionar
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Card de cada produto
  card: {
    flexDirection: 'row',
    width: '95%',
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginTop: 12,
    marginHorizontal: 10,
    overflow: 'hidden',

    // Sombra iOS
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    // Sombra Android
    elevation: 4,
  },

  cardContent: {
    marginBottom: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  // Área dos botões
  actions: {
    flexDirection: "row",
  },

  iconButton: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: 5
  },

  iconText: {
    fontWeight: "600",
  },
});