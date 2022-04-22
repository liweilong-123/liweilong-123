import React, { useEffect, useState } from "react";
import { Image, Carousel } from 'antd';
import { view1Res } from '../test'

export const View1 = () => {
    //
    const [listData, setListData] = useState([]);
    const [bannerData, setBannerData] = useState([]);


    useEffect(() => {
        fetch("http://192.168.89.72:81/v1/mock/page").then(response => { console.log(response); return response.json() }).then((res) => {
        // const res = { data: view1Res };
            if (res && res.data) {
                console.log(res.data)
                setListData(res.data.posts);
                setBannerData(res.data.banner);
            }    
        });
    }, [])

    return (
        <div style={{ width: '50%', margin:'auto' }}>
            <Carousel>
                {bannerData.map((val, index) => {
                    return (
                        <div key={val.id}>
                            <img alt='' height={'200px'} width={'100%'} src={val.img}></img>
                        </div>
                    )
                })}
            </Carousel>
            <div style={{ display: 'inline-block', border: '1px solid', width: '100%' }}>
                {listData.map((val, index) => {
                    return (
                        <>
                            <div key={index} style={{ display: 'flex', margin: '5px' }}>
                                <Image width={200} src={val.cover}></Image>
                                <span 
                                    style={{ padding: '0 5px 0 5px', textAlign: 'left', fontWeight: '600', flex: '1' }}>
                                    {val.title}
                                </span>
                            </div>
                        </>
                    )
                })}
            </div>
        </div>
    )
}