import React, { useState } from 'react';
import {
    FlatList,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import { styles } from './styles';

import { ModalView } from './views/ModalView';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from './App';

const KEYS = {
    fullScreen: 'fs',
    splitView: 'sv',
    modal: 'm',
};

type Props = StackScreenProps<RootStackParamList, 'list'>;

export const ListPage = ({ navigation }: Props) => {

    const [modalVisible, setModalVisible] = useState(false);

    const handleClick = (key: string) => {
        switch (key) {
            case KEYS.fullScreen:
                navigation.navigate('fs');
                break;
            case KEYS.splitView:
                navigation.navigate('sv');
                break;
            case KEYS.modal:
                setModalVisible(true);
                break;
        }
    }

    return (
        <View style={styles.listPage}>
            <FlatList
                style={styles.listContainer}
                data={[
                    {key: KEYS.fullScreen, text: 'Full Screen'},
                    {key: KEYS.splitView, text: 'Split View'},
                    {key: KEYS.modal, text: 'Modal'},
                ]}
                renderItem={({item, index}) =>
                    <TouchableWithoutFeedback onPress={() => handleClick(item.key)}>
                        <View style={styles.item}>
                            <Text>{item.text}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                }
            />
            <ModalView modalVisible={modalVisible} setModalVisible={setModalVisible}/>
        </View>
    )
}
