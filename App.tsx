import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Config from 'react-native-config';
const {height: HEIGHT, width: WIDTH} = Dimensions.get('window');

const API_URL =
  'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20';

const SMALL_IMAGE_SIZE = 80;
const SPACING = 10;

const fetchImages = async () => {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: Config.API_KEY,
    },
  });
  const {photos} = await response.json();
  return photos;
};

type ImageDataType = {
  src: {portrait: string};
};

const App = () => {
  const [imagesData, setImagesData] = useState([]);

  const topFlatlistRef = useRef<FlatList>(null);
  const bottomFlatlistRef = useRef<FlatList>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const getImages = async () => {
      const photos = await fetchImages();
      setImagesData(photos);
    };

    getImages();
  }, []);

  const changeActiveIndex = (index: number) => {
    setActiveIndex(index);
    topFlatlistRef.current?.scrollToOffset({
      offset: index * WIDTH,
      animated: true,
    });

    if (
      index * (SMALL_IMAGE_SIZE + SPACING) - SMALL_IMAGE_SIZE / 2 >
      WIDTH / 2
    ) {
      bottomFlatlistRef.current?.scrollToOffset({
        offset:
          index * (SMALL_IMAGE_SIZE + SPACING) -
          WIDTH / 2 +
          SMALL_IMAGE_SIZE / 2,
        animated: true,
      });
    } else {
      bottomFlatlistRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    changeActiveIndex(Math.floor(event.nativeEvent.contentOffset.x / WIDTH));
  };

  const renderSmallImageItem = ({
    item,
    index,
  }: {
    item: ImageDataType;
    index: number;
  }) => {
    return (
      <TouchableOpacity onPress={() => changeActiveIndex(index)}>
        <Image
          source={{uri: item.src.portrait}}
          style={[
            styles.smallImage,
            activeIndex === index && styles.selectedImage,
          ]}
        />
      </TouchableOpacity>
    );
  };

  const renderLargeImageItem = ({item}: {item: ImageDataType}) => {
    return (
      <Image
        source={{uri: item.src.portrait}}
        style={[{height: HEIGHT, width: WIDTH}]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={topFlatlistRef}
        data={imagesData}
        renderItem={renderLargeImageItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.topFlatlist}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      <FlatList
        ref={bottomFlatlistRef}
        data={imagesData}
        renderItem={renderSmallImageItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: SPACING}}
        style={styles.bottomFlatlist}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {flex: 1},
  topFlatlist: {height: HEIGHT, width: WIDTH},
  bottomFlatlist: {
    position: 'absolute',
    height: SMALL_IMAGE_SIZE,
    bottom: SMALL_IMAGE_SIZE,
  },
  smallImage: {
    height: SMALL_IMAGE_SIZE,
    width: SMALL_IMAGE_SIZE,
    borderRadius: 12,
    marginRight: SPACING,
  },
  selectedImage: {
    borderWidth: 1,
    borderColor: '#fff',
  },
});
