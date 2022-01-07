<template>
  <view className='index'>
    <van-sticky>
      <van-row>
        <van-col :span="20">
          <van-field
            label="总投资金额"
            type="text"
            placeholder="请输入总投资金额"
            :value="investmentAmount"
            center
            input-align="center"
          >
          </van-field>
        </van-col>
        <van-col :span="4">
          <van-icon name="add" info="9" @tap="addProduct" />
        </van-col>
      </van-row>
    </van-sticky>
    <van-swipe-cell :right-width="65" @click="onOpen">
      <van-panel title="标题" desc="描述信息" status="状态">
        <view>内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容内容</view>
      </van-panel>
      <slot-view name="right">删除
      </slot-view>
    </van-swipe-cell>
    <van-slider :value="value" step="10" :use-button-slot="true" @change="valueChange">
      <slot-view class="custom-button" name="button">{{ value }}/100</slot-view>
    </van-slider>
    <van-panel title="标题" desc="描述信息" status="状态">
      <view>内容</view>
    </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel><van-panel title="标题" desc="描述信息" status="状态">
    <view>内容</view>
  </van-panel>
    <van-popup :show="show" position="bottom">
      <van-picker :columns="columns" :show-toolbar="true" @change="onChange" @confirm="onConfirm" @cancel="onCancel" />
    </van-popup>
  </view>
</template>

<script>
import './index.scss'
const products = {
  债券私募: ['中湛恒久1号', '中湛鲁政1号', '中湛黔进1号', '中湛黔进2号'],
  权益私募: ['道昆中证500指数增强策略', '道昆量化阿尔法1号', '元兹FOF1号'],
  期货资管: ['ZY月鑫宝', 'ZY中宁2号', 'ZY苏鲁仁广1号'],
};
export default {
  name: 'Index',
  components: {
  },
  data() {
    return {
      value: 50,
      investmentAmount: '',
      columns: [
        {
          values: Object.keys(products),
          className: 'column1',
        },
        {
          values: products['债券私募'],
          className: 'column2',
        },
      ],
      show: true
    }
  },
  methods: {
    onClick(e) {
      console.log(e);
    },
    valueChange(e) {
      this.value = e.detail
      console.log(e)
    },
    onOpen(e) {
      console.log(e)
    },
    onChange(event) {
      const { picker, value, index } = event.detail;
      picker.setColumnValues(1, citys[value[0]]);
    },
    onConfirm(e) {
      console.log(e);
    },
    onCancel(e) {
      this.show = false;
    },
    addProduct() {

    }
  }
}
</script>
