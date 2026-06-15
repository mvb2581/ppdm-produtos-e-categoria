// Importa a barra de status do Expo
import { StatusBar } from 'expo-status-bar';

// Hooks do React para estado, efeitos e otimização de funções
import { useState, useEffect, useCallback } from 'react';

// Componentes visuais do React Native
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';

// Navegação entre telas
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';


export default function CategoriaScreen() {
  // Hook para navegação entre telas
  const navigation = useNavigation();

  // Estado que armazena a lista de categorias
  const [categorias, setCategorias] = useState([]);

  // Executa uma vez ao montar o componente
  useEffect(() => {
    try {
      const setup = async () => {

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
        await loadData(); // Recarrega os dados ao voltar para a tela
      }
      load();
    }, [])
  );

  // Função para buscar todas as categorias
  async function loadData() {
    try {
        const response = await api.get('/categorias'); 
        setCategorias(response.data.result);
    } catch (error) {
      console.log(error);
      Alert.alert('Ocorreu um erro', error.message);
    }

  }

  // Função para deletar uma categoria
  async function deletarCategoria(id) {
    // Exibe alerta de confirmação
    Alert.alert('Confirmação', 'Deseja realmente excluir esta categoria?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Validação básica do ID
              if (!id || id <= 0) {
                Alert.alert('Atencão', 'ID da categoria é inválido');
                return
              }

              await api.delete(`/categorias/${id}`);

              await loadData();

            } catch (error) {
              // Tratamento de erro específico de chave estrangeira
              if (error?.message?.includes('FOREIGN KEY constraint failed')) {
                Alert.alert(
                  "Exclusão bloqueada",
                  "Essa categoria possui produtos vinculados."
                );
              } else {
                Alert.alert("Erro", "Não foi possível excluir a categoria.");
              }
            }
          }
        }
      ]
    )
  }

  // Função para editar uma categoria
  async function editarCategoria(item) {
    try {
      // Validação se item foi selecionado
      if (!item) {
        Alert.alert('Atencão', 'Selecione uma categoria para editar');
        return
      }

      // Navega para tela de edição passando o item
      navigation.navigate('CategoriaScreenEditar', item)

    } catch (error) {
      // Tratamento de erro (mensagem reaproveitada)
      if (error?.message?.includes('FOREIGN KEY constraint failed')) {
        Alert.alert(
          "Exclusão bloqueada",
          "Essa categoria possui produtos vinculados."
        );
      } else {
        Alert.alert("Erro", "Não foi possível excluir a categoria.");
      }
    }
  }

  // Renderização da tela
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Cabeçalho com título e botão de adicionar */}
      <View style={styles.header}>
        <Text style={styles.titleScreen}>Gestão de categorias</Text>

        {/* Botão para navegar para tela de inclusão */}
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CategoriaScreenIncluir')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de categorias */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => String(item.Id)} // Define chave única
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (

          <View style={styles.card}>

            {/* Barra lateral decorativa */}
            <View style={styles.sideBar} />

            <View style={styles.conteudo}>

              <View style={styles.cardInner}>
                <View style={styles.cardContent}>
                  {/* Exibição dos dados da categoria */}
                  <Text style={styles.title}>ID: {item.Id}</Text>
                  <Text style={styles.title}>Categoria: {item.Nome}</Text>
                </View>
              </View>

              {/* Botões de ação */}
              <View style={styles.actions}>

                {/* Botão de editar */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#E3F2FD" }]}
                  onPress={() => editarCategoria(item)}
                >
                  <Text style={styles.iconText}>✏️ Editar</Text>
                </TouchableOpacity>

                {/* Botão de excluir */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#FFEBEE" }]}
                  onPress={() => deletarCategoria(item.Id)}
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
    borderRadius: 25,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
  },

  // Card de cada item da lista
  card: {
    flexDirection: 'row',
    width: '95%',
    backgroundColor: "#ffffff",
    borderRadius: 6,
    marginTop: 12,
    marginHorizontal: 10,
    overflow: 'hidden',

    // Sombra iOS
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    // Sombra Android
    elevation: 2,
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
  }
});