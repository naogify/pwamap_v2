import React, { useEffect } from "react";
import ShopListItem from './ShopListItem'
import Shop from './Shop'
import './List.scss'
import { useSearchParams, useNavigate } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import { askGeolocationPermission } from '../geolocation'
import Loading from './Loading'
import * as turf from "@turf/turf"

type Props = {
  data: Pwamap.ShopData[];
}

const sortShopList = async (shopList: Pwamap.ShopData[]) => {
  const currentPosition = await askGeolocationPermission()
  if(currentPosition) {
    const from = turf.point(currentPosition);
    const sortingShopList = shopList.map((shop) => {
      const lng = parseFloat(shop['経度'])
      const lat = parseFloat(shop['緯度'])
      if(Number.isNaN(lng) || Number.isNaN(lat)) {
        return shop
      } else {
        const to = turf.point([lng, lat])
        const distance = turf.distance(from, to, {units: 'meters' as 'meters'});
        return { ...shop, distance }
      }
    })
    sortingShopList.sort((a,b) => {
      if(typeof a.distance !== 'number' || Number.isNaN(a.distance)) {
        return 1
      } else if (typeof b.distance !== 'number' || Number.isNaN(b.distance)) {
        return -1
      } else {
        return a.distance - b.distance
      }
    })
    return sortingShopList
  } else {
    return shopList
  }
}

const Content = (props: Props) => {

  const [shop, setShop] = React.useState<Pwamap.ShopData | undefined>()
  const [data, setData] = React.useState<Pwamap.ShopData[]>(props.data)
  const [list, setList] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(10);
  const [hasMore, setHasMore] = React.useState(true);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get('category')
  const queryId = searchParams.get('id')

  React.useEffect(() => {

    let data = props.data;

    if (queryCategory) {
      data = props.data.filter((shop) => {
        return shop['カテゴリ'] === queryCategory
      })
    }

    let isMounted = true
    // prevent memory leak
    if (isMounted) {

      const orderBy = process.env.REACT_APP_ORDERBY || 'distance'

      if (orderBy === 'distance') {

        sortShopList(data)
          .then(sortedData => {
            // prevent memory leak
            if (isMounted) {
              setList(sortedData.slice(0, page))
              setData(sortedData)
            }
          })

      } else {
        setList(data.slice(0, page))
        setData(data)
      }
    }

    return () => {
      isMounted = false
    }
  }, [props.data, queryCategory, page])


  const popupHandler = (shop: Pwamap.ShopData) => {
    if (shop) {
      setShop(shop)
      setSearchParams({'id': shop['id']})
    }
  }

  const closeHandler = () => {
    setShop(undefined)
    navigate("/list");
  }

    //項目を読み込むときのコールバック
    const loadMore = () => {

      //データ件数が0件の場合、処理終了
      if (list.length >= data.length) {
        setHasMore(false);
        return;
      }

      setList([...list, ...data.slice(page, page + 10)])
      setPage(page + 10)
    }

  useEffect(() => {

    if (queryId && list) {
      const shop = list.find((shop) => {
        return shop['id'] === queryId
      })
      if (shop) {
        setShop(shop)
      }
    }
  }, [list, queryId])

  return (
    <div id="shop-list" className="shop-list">
      {queryCategory && <div className="shop-list-category">{`カテゴリ：「${queryCategory}」`}</div>}

      <InfiniteScroll
        dataLength={list.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<Loading />}
        scrollableTarget="shop-list"
        style={{width: '100%', height: '100%'}}
      >
        {
          list.map((item, index) => {

            return (<div key={index} className="shop">
              <ShopListItem
                data={item}
                popupHandler={popupHandler}
                queryCategory={queryCategory}
              />
            </div>)

          })
        }
      </InfiniteScroll>
      {shop ?
        <Shop shop={shop} close={closeHandler} />
        :
        <></>
      }
    </div>
  );
};

export default Content;
