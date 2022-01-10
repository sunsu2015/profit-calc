<template>
  <view className='index'>
    <van-sticky>
      <van-row>
        <van-col :span="16">
          <van-field
            label="总投资金额"
            type="text"
            placeholder="总投资金额"
            :value="investmentAmountTotal"
            right
            input-align="right"
            border="false"
            error-message-align="right"
            :error-message="investmentAmountTotalErrMsg"
            @blur="investmentAmountTotalBlur($event, null, 'investmentAmountTotal')"
            @focus="focus(null, 'investmentAmountTotal')"
          >
            <slot-view name="right-icon"><text style="font-size: var(--cell-font-size,28rpx);">万</text></slot-view>
          </van-field>
        </van-col>
        <van-col :span="5">
            <van-tag :color="customerType === 'positive'?'#1989fa' : 'grey'" @tap="preset('positive')">激进型</van-tag>
            <van-tag :color="customerType === 'conservative'?'#1989fa' : 'grey'" @tap="preset('conservative')">稳健型</van-tag>
        </van-col>
        <van-col :span="3">
          <van-icon v-if="selectedProducts.length" name="add" :info="selectedProducts.length" @tap="addProduct();editIndex=-1;" />
          <van-icon v-if="!selectedProducts.length" name="add" @tap="addProduct();editIndex=-1;" />
        </van-col>
        <van-col :span="24">
          <view v-if="unsetInvestmentAmount>0 && !hasError()" style="padding-left: var(--cell-horizontal-padding, 32rpx);">
            <text style="color: #ff976a;font-size: var(--cell-font-size,24rpx);">待分配投资金额{{amountPipe(unsetInvestmentAmount)}}万</text>
          </view>
          <view v-if="unsetInvestmentAmount===0 && !hasError()" style="padding-left: var(--cell-horizontal-padding, 32rpx);margin-bottom: var(--cell-vertical-margin, 10rpx);">
            <van-tag v-if="oneYearProfit" style="padding-left:20rpx;" type="danger">一年总收益:{{amountPipe(oneYearProfit)}}<text v-if="oneYearProfitMax">~{{amountPipe(oneYearProfitMax)}}</text>万</van-tag>&nbsp;
            <van-tag v-if="twoYearProfit" type="danger">两年总收益:{{amountPipe(twoYearProfit)}}<text v-if="twoYearProfitMax">~{{amountPipe(twoYearProfitMax)}}</text>万</van-tag>
          </view>
          <view v-if="hasError()" style="padding-left: var(--cell-horizontal-padding, 32rpx);">
            <text style="color: #ee0a24;font-size: var(--cell-font-size,24rpx);">存在错误尚未处理</text>
          </view>
        </van-col>
      </van-row>
    </van-sticky>
    <!-- van-cell__title van-cell__value van-cell__label -->
    <view class="panel" :class="{first: !i}" v-for="(p, i) in selectedProducts" :key="p.name">
      <van-swipe-cell :right-width="65" @click="remove($event, i)">
        <!--  :title="p.name" :desc="p.manager" status="状态" -->
        <van-panel>
          <slot-view name="header">
            <view class="van-cell">
              <view class="van-cell__title">
                {{p.name}}
                <van-tag type="warning">{{precisionDispose(p.rate * 100)}}<text v-if="p.maxRate">~{{precisionDispose(p.maxRate * 100)}}</text>%(年化)</van-tag>&nbsp;
                <van-tag type="primary">{{p.period}}个月</van-tag>&nbsp;
                <van-tag type="success">{{p.type}}</van-tag>&nbsp;
                <view class="van-cell__label">
                  <van-tag v-if="p.profit" type="danger">收益：{{amountPipe(p.profit)}}<text v-if="p.maxProfit">~{{amountPipe(p.maxProfit)}}</text>万</van-tag>
                </view>
              </view>
              <view><van-icon name="records" @tap="addProduct(p);editIndex=i;" /></view>
            </view>
          </slot-view>
          <view>
            <!-- <view style="font-size: var(--cell-font-size,28rpx);padding-bottom: var(--cell-vertical-padding, 20rpx);">投资金额（万元）</view> -->
            <van-field
              label="投资金额"
              type="text"
              :placeholder="p.placeholder"
              :value="p.investmentAmount"
              right
              input-align="right"
              error-message-align="right"
              :error-message="p.investmentAmountErrMsg"
              @blur="investmentAmountBlur($event, p, 'investmentAmount')"
              @focus="focus(p, 'investmentAmount')"
            >
              <slot-view name="right-icon"><text style="font-size: var(--cell-font-size,28rpx);">万</text></slot-view>
            </van-field>
            <van-field
              label="比例"
              type="number"
              placeholder="请输入比例"
              :value="p.investmentRate"
              right
              input-align="right"
              error-message-align="right"
              :error-message="p.investmentRateErrMsg"
              @blur="investmentRateBlur($event, p, 'investmentRate')"
            >
              <slot-view name="right-icon"><text style="font-size: var(--cell-font-size,28rpx);">%</text></slot-view>
            </van-field>
          </view>
        </van-panel>
        <slot-view name="right">删除
        </slot-view>
      </van-swipe-cell>
    </view>
    <!-- <van-slider :value="value" step="10" :use-button-slot="true" @change="valueChange">
      <slot-view class="custom-button" name="button">{{ value }}/100</slot-view>
    </van-slider> -->
    <van-popup :show="show" position="bottom">
      <van-picker id="picker" :columns="columns" :show-toolbar="true" @change="onChange" @confirm="onConfirm" @cancel="onCancel" />
    </van-popup>
    <van-notify id="van-notify" />
    <view v-show="loading" style="position: absolute;top: 50%; left: 50%; transform: translate(-50%, -50%)">
      <van-loading color="#1989fa" />
    </view>
  </view>
</template>

<script>
import './index.scss'
import Notify from '@vant/notify/notify';
import {getCurrentInstance} from "@tarojs/taro";
const products = {
  债券私募: ['中湛恒久1号', '中湛鲁政1号', '中湛黔进1号', '中湛黔进2号'],
  权益私募: ['道昆中证500指数增强策略', '道昆量化阿尔法1号'],
  期货资管: ['ZY月鑫宝', 'ZY中宁2号', 'ZY苏鲁仁广1号'],
  信托: ['平安信托'],
};
const productDetail = [{
  type: '债券私募', name: '中湛恒久1号', status: '募集中', foundDate: '', period: '24', rate: '0.075', maxRate: '', minInvestmentAmount: '100', interestPayType:'赎回付息', manager: '中湛私募'
}, {
  type: '债券私募', name: '中湛鲁政1号', status: '募集中', foundDate: '', period: '14', rate: '0.077', maxRate: '', minInvestmentAmount: '100', interestPayType:'赎回付息', manager: '中湛私募'
}, {
  type: '债券私募', name: '中湛黔进1号', status: '准备备案', foundDate: '', period: '12', rate: '0.08', maxRate: '', minInvestmentAmount: '100', interestPayType:'赎回付息', manager: '中湛私募'
}, {
  type: '债券私募', name: '中湛黔进2号', status: '准备备案', foundDate: '', period: '24', rate: '0.085', maxRate: '', minInvestmentAmount: '100', interestPayType:'赎回付息', manager: '中湛私募'
}, {
  type: '权益私募', name: '道昆中证500指数增强策略', status: '募集中', foundDate: '20211216', period: '12', rate: '-0.03', maxRate: '0.2', minInvestmentAmount: '100', interestPayType:'', manager: '道昆资产'
}, {
  type: '权益私募', name: '道昆量化阿尔法1号', status: '募集中', foundDate: '20211216', period: '12', rate: '-0.03', maxRate: '0.2', minInvestmentAmount: '100', interestPayType:'', manager: '道昆资产'
}, {
  type: '期货资管', name: 'ZY月鑫宝', status: '募集中', foundDate: '20210804', period: '1', rate: '0.06', maxRate: '', minInvestmentAmount: '30', interestPayType:'赎回付息', manager: '中原期货'
}, {
  type: '期货资管', name: 'ZY中宁2号', status: '募集中', foundDate: '20211020', period: '12', rate: '0.075', maxRate: '', minInvestmentAmount: '30', interestPayType:'赎回付息', manager: '中原期货'
}, {
  type: '期货资管', name: 'ZY苏鲁仁广1号', status: '募集中', foundDate: '20210827', period: '24', rate: '0.08', maxRate: '', minInvestmentAmount: '30', interestPayType:'赎回付息', manager: '中原期货'
}, {
  type: '信托', name: '平安信托', status: '募集中', foundDate: '20211214', period: '12', rate: '0.07', maxRate: '', minInvestmentAmount: '30', interestPayType:'赎回付息', manager: '利位投顾'
}];
const validateMethods = {
  isEmpty: (value) => {
    if (typeof value === 'undefined' || value === 'null' || value === null || (typeof value === 'string' && value === '') || JSON.stringify(value) === '{}') {
      return true;
    }
    return false;
  },
  isAmount: (value) => {
    if (/^(0|[1-9]\d{0,9})([.]\d{1,2})?$/.test(value)) {
      return true;
    }
    return false;
  },
  isPercentage: (value) => {
    if (/^(0|[1-9]\d{0,2})([.]\d{1,2})?$/.test(value)) {
      return true;
    }
    return false;
  }
}
const validate = {
  investmentAmountTotal: (val, data) => {
    if(validateMethods.isEmpty(val)) {
      return '请输入金额'
    }
    if (!validateMethods.isAmount(val.toString().replace(/,/g, '').replace('.00', ''))) {
      return '金额格式错误'
    }
  },
  investmentAmount: (val, data) => {
    if (validateMethods.isEmpty(val)) {
      return '请输入金额'
    }
    const investmentAmount = val.toString().replace(/,/g, '').replace('.00', '');
    if (!validateMethods.isAmount(investmentAmount)) {
      return '金额格式错误'
    }
    if (investmentAmount - data.minInvestmentAmount < 0) {
      return `${data.minInvestmentAmount}万起投`
    }
    return null
  },
  investmentRate: (val, data) => {
    if (validateMethods.isEmpty(val)) {
      return '请输入比例'
    }
    if (!validateMethods.isPercentage(val)) {
      return '比例格式错误'
    }
    if (val - 100 > 0) {
      return `比例不能超过100%`
    }
    return null
  }
}
// 稳健：月薪宝40%，中宁30%，鲁政30%；
// 激进：月薪宝30，中宁30，鲁政15，量化15，恒久10

const fastPreset = {
  positive: [{
      name: 'ZY月鑫宝', investmentRate: '30.00'
    }, {
      name: 'ZY中宁2号', investmentRate: '30.00'
    }, {
      name: '中湛鲁政1号', investmentRate: '15.00'
    }, {
      name: '道昆量化阿尔法1号', investmentRate: '15.00'
    }, {
      name: '中湛恒久1号', investmentRate: '10.00'
    }
  ],
  conservative: [{
      name: 'ZY月鑫宝', investmentRate: '40.00'
    }, {
      name: 'ZY中宁2号', investmentRate: '30.00'
    }, {
      name: '中湛鲁政1号', investmentRate: '30.00'
    }
  ]
}
export default {
  name: 'Index',
  components: {
  },
  data() {
    return {
      investmentAmountTotal: '',
      investmentAmountTotalErrMsg: '',
      columns: [
        {
          values: Object.keys(products),
          className: 'column1',
          defaultIndex: 0
        },
        {
          values: products['债券私募'],
          className: 'column2'
        }
      ],
      show: false,
      selectedProducts: [],
      editIndex: -1,
      oneYearProfit: 0,
      oneYearProfitMax: 0,
      twoYearProfit: 0,
      twoYearProfitMax: 0,
      loading: true
    }
  },
  methods: {
    // valueChange(e) {
    //   this.value = e.detail
    //   console.log(e)
    // },
    remove(e, i) {
      if (e.detail === 'right') {
        this.selectedProducts.splice(i, 1);
        this.calcTotalProfit();
      }
    },
    onChange(event) {
      const { picker, value, index } = event.detail;
      picker.setColumnValues(1, products[value[0]]);
    },
    onConfirm(e) {
      if (this.editIndex !== -1) { // 编辑
        const exist = this.selectedProducts.filter(item => item.name !== this.selectedProducts[this.editIndex].name).find(item => item.name === e.detail.value[1]);
        if (exist) {
          return Notify({type: 'warning', message: `产品列表里已存在${exist.name}，请勿重复选择`})
        }
        const selectedProduct = productDetail.find(item => item.name === e.detail.value[1]);
        this.selectedProducts.splice(this.editIndex, 1, {
          ...selectedProduct, investmentAmount: '', investmentAmountErrMsg: '', investmentRate: '', investmentRateErrMsg: '', profit: '', maxProfit: '', placeholder: ''
        });
      } else {
        const exist = this.selectedProducts.find(item => item.name === e.detail.value[1]);
        if (exist) {
          return Notify({type: 'warning', message: `产品列表里已存在${exist.name}，请勿重复选择`})
        }
        const selectedProduct = productDetail.find(item => item.name === e.detail.value[1]);
        this.selectedProducts.push({
          ...selectedProduct, investmentAmount: '', investmentAmountErrMsg: '', investmentRate: '', investmentRateErrMsg: '', profit: '', maxProfit: '', placeholder: ''
        });
      }
      this.calcPlaceholder();
      this.show = false;
    },
    onCancel(e) {
      this.show = false;
    },
    addProduct(obj) {
      const { page } = getCurrentInstance()
      const picker = page.selectComponent('#picker');
      if (obj) {
        picker.setColumnValues(1, products[obj.type]);
        picker.setColumnValue(0, obj.type);
        picker.setColumnValue(1, obj.name);
        console.log(picker.getColumnValue(1))
      } else {
        const column0Value = picker.getColumnValue(0);
        picker.setColumnValues(1, products[column0Value]);
      }
      setTimeout(() => {
        if (this.investmentAmountTotal) {
          if (this.investmentAmountTotalErrMsg) {
            return;
          }
          this.show = true;
        } else {
          Notify({ type: 'warning', message: '请先输入总投资金额' })
        }
      }, 100);
    },
    amountPipe(val) {
        // 金额转换 分->元 保留2位小数 并每隔3位用逗号分开 1,234.56
        const str = Number(val).toFixed(2);
        const intSum = str.substring(0, str.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ','); // 取到整数部分
        const dot = str.substring(str.length, str.indexOf('.')) // 取到小数部分搜索
        const ret = intSum + dot;
        return ret
    },
    foramtRate(obj, key) {
      const val = obj[key];
      if (typeof val !== 'undefined' && val !== null && val !== '') {
        obj[key] = Number(val).toFixed(2);
      } else {
        obj[key] = '';
      }
    },
    format(e, obj, key) {
      // if (!obj) {obj = this;}
      // obj[key] = e.detail.value;
      const val = obj[key];
      if (typeof val !== 'undefined' && val !== null && val !== '') {
        obj[key] = this.amountPipe(val);
      } else {
        obj[key] = '';
      }
    },
    focus(obj, key) {
      if (!obj) {obj = this;}
      const val = obj[key];
      if (typeof val !== 'undefined' && val !== null && val !== '') {
        const ret = val.toString().replace(/,/g, '');
        obj[key] = ret.replace('.00', '');
      }
    },
    calcAmount(obj) {
      const rate = obj.investmentRate;
      let investmentAmount = this.investmentAmountTotal;
      if (typeof rate !== 'undefined' && rate !== null && rate !== '') {
        if (investmentAmount) {
          investmentAmount = investmentAmount.toString().replace(/,/g, '').replace('.00', '');
          this.investmentAmountBlur({detail: {value: rate / 100 * investmentAmount}}, obj, 'investmentAmount');
        } else {
          obj.investmentAmount = '';
          Notify({ type: 'warning', message: '请先输入总投资金额' });
        }
      }
    },
    calcRate(obj) {
      let amount = obj.investmentAmount;
      let investmentAmount = this.investmentAmountTotal;
      if (typeof amount !== 'undefined' && amount !== null && amount !== '') {
        amount = amount.toString().replace(/,/g, '').replace('.00', '');
        if (investmentAmount) {
          investmentAmount = investmentAmount.toString().replace(/,/g, '').replace('.00', '');
          obj.investmentRate = (100 * amount / investmentAmount).toFixed(2)
        } else {
          obj.investmentRate = '';
          Notify({ type: 'warning', message: '请先输入总投资金额' });
        }
      }
    },
    calcSingleProfit(obj) {
      let amount = obj.investmentAmount;
      if (typeof amount !== 'undefined' && amount !== null && amount !== '') {
        amount = amount.toString().replace(/,/g, '').replace('.00', '');
        obj.profit = this.precisionDispose((obj.rate / 12 * obj.period) * amount);
        if (obj.maxRate) {
          obj.maxProfit = this.precisionDispose((obj.maxRate / 12 * obj.period) * amount);
        }
      } else {
        obj.profit = '';
      }
    },
    precisionDispose(val) {
      // 四舍五入
      return parseFloat((Math.round(val * 100) / 100).toFixed(2));
    },
    calcTotalProfit() {
      this.oneYearProfit = 0;
      this.oneYearProfitMax = 0;
      this.twoYearProfit = 0;
      this.twoYearProfitMax = 0;
      this.selectedProducts.forEach(item => {
        let amount = item.investmentAmount;
        if (typeof amount !== 'undefined' && amount !== null && amount !== '') {
          amount = amount.toString().replace('.00', '');
          if (item.period < 12) { // 不足一年的按一年算
            this.oneYearProfit += this.precisionDispose(item.rate * amount);
            if (item.maxRate) {
              this.oneYearProfitMax += this.precisionDispose(item.maxRate * amount);
            } else {
              this.oneYearProfitMax += this.precisionDispose(item.rate * amount);
            }
          } else if (item.period < 24) { // 大于等于一年不足两年的按实际算
            this.oneYearProfit += item.profit;
            if (item.maxRate) {
              this.oneYearProfitMax += item.maxProfit;
            } else {
              this.oneYearProfitMax += item.profit;
            }
          } else { // 两年的算到两年里
            this.twoYearProfit += item.profit;
            if (item.maxRate) {
              this.twoYearProfitMax += item.maxProfit;
            } else {
              this.twoYearProfitMax += item.profit;
            }
          }
        }
      });
      if (this.oneYearProfit && this.twoYearProfit) {
        this.twoYearProfit += 2 * this.oneYearProfit;
      }
      if (this.oneYearProfitMax && this.twoYearProfitMax) {
        this.twoYearProfitMax += 2 * this.oneYearProfitMax;
      }
      if (this.oneYearProfit === this.oneYearProfitMax) {
        this.oneYearProfitMax = 0;
      }
      if (this.twoYearProfit === this.twoYearProfitMax) {
        this.twoYearProfitMax = 0;
      }
    },
    reCalc() {
      this.selectedProducts.forEach(item => {
        this.calcAmount(item);
      })
      this.selectedProducts.forEach(item => {
        this.validator(item, 'investmentAmount');
      })
    },
    calcPlaceholder() {
      const alreadySetInvestmentAmount = this.selectedProducts.map(item => {
        if (item.investmentAmount) {
          return Number(item.investmentAmount.toString().replace(/,/g, '').replace('.00', ''));
        } else {
          return 0;
        }
      }).reduce((sum, item) => sum += item, 0);
      this.selectedProducts.forEach(item => {
        if (!item.investmentAmount) {
          if (this.investmentAmountTotal) {
            const totalInvestmentAmount = this.investmentAmountTotal.toString().replace(/,/g, '').replace('.00', '');
            item.placeholder = `${item.minInvestmentAmount}万起投，最多还可输入${this.precisionDispose(totalInvestmentAmount - alreadySetInvestmentAmount)}万`
          }
        }
      })
    },
    validator(obj, key) {
      obj[key + 'ErrMsg'] = validate[key](obj[key], obj);
      if (obj[key + 'ErrMsg']) {
        return false;
      }
      return true;
    },
    investmentAmountTotalBlur(e, obj, key) {
      if (!obj) {obj = this;}
      obj[key] = e.detail.value;
      const valid = this.validator(obj, key);
      if(!valid) {return}
      this.format(e, obj, key);
      this.reCalc();
      this.calcPlaceholder();
    },
    investmentAmountBlur(e, obj, key) {
      obj[key] = e.detail.value;
      const valid = this.validator(obj, key);
      if(!valid) {return}
      const alreadySetInvestmentAmount = this.selectedProducts.map(item => {
        if (item.investmentAmount) {
          return Number(item.investmentAmount.toString().replace(/,/g, '').replace('.00', ''));
        } else {
          return 0;
        }
      }).reduce((sum, item) => sum += item, 0);
      const investmentAmountTotal = this.investmentAmountTotal ? this.investmentAmountTotal.toString().replace(/,/g, '').replace('.00', '') : 0;
      if (alreadySetInvestmentAmount - investmentAmountTotal > 0) {
        return obj[key + 'ErrMsg'] = `投资金额之和超过总投资金额`;
      }
      this.format(e, obj, key);
      this.calcRate(obj);
      this.calcSingleProfit(obj);
      this.calcTotalProfit();
      this.calcPlaceholder();
    },
    investmentRateBlur(e, obj, key) {
      obj[key] = e.detail.value;
      const valid = this.validator(obj, key);
      if(!valid) {return}
      const alreadySetInvestmentRate = this.selectedProducts.map(item => {
        if (item.investmentRate) {
          return Number(item.investmentRate);
        } else {
          return 0;
        }
      }).reduce((sum, item) => sum += item, 0);
      if (alreadySetInvestmentRate - 100 > 0) {
        return obj[key + 'ErrMsg'] = `比例之和不能超过100%`;
      }
      this.foramtRate(obj, key);
      this.calcAmount(obj);
      this.calcSingleProfit(obj);
      this.calcTotalProfit();
      this.calcPlaceholder();
    },
    preset(customerType) {
      setTimeout(() => {
        const investmentAmountTotal = Number(this.investmentAmountTotal.toString().replace(/,/g, '').replace('.00', ''));
        if (investmentAmountTotal >= 1000) {
          this.selectedProducts = fastPreset[customerType].map(item => {
            const match = productDetail.find(ele => ele.name === item.name);
            return {...match, ...item};
          })
          this.selectedProducts.forEach(item => this.investmentRateBlur({detail: {value: item.investmentRate}}, item, 'investmentRate'));
        } else {
          return Notify({type: 'warning', message: `总投资金额需要至少1,000.00万`})
        }
      }, 100);
    },
    hasError() {
      console.log(this.investmentAmountTotalErrMsg)
      console.log(this.selectedProducts.filter(item => item.investmentAmountErrMsg || item.investmentRateErrMsg).length)
      return !!this.investmentAmountTotalErrMsg || this.selectedProducts.filter(item => item.investmentAmountErrMsg || item.investmentRateErrMsg).length
    }
  },
  computed:{
    unsetInvestmentAmount: function() {

      if (this.investmentAmountTotal) {
        const alreadySetInvestmentAmount = this.selectedProducts.map(item => {
          if (item.investmentAmount) {
            return Number(item.investmentAmount.toString().replace(/,/g, '').replace('.00', ''));
          } else {
            return 0;
          }
        }).reduce((sum, item) => sum += item, 0);
        const investmentAmountTotal = this.investmentAmountTotal.toString().replace(/,/g, '').replace('.00', '');
        return investmentAmountTotal - alreadySetInvestmentAmount;
      } else {
        return null;
      }
    },
    customerType: function() {
      this.loading = true
      const investmentAmountTotal = Number(this.investmentAmountTotal.toString().replace(/,/g, '').replace('.00', ''));
      if (investmentAmountTotal >= 1000) {
        if (this.selectedProducts.length === fastPreset.conservative.length) {
          let match = true
          fastPreset.conservative.forEach(item => {
            const find = this.selectedProducts.find(ele => ele.name === item.name) || {};
            if (find.investmentRate - item.investmentRate !== 0) {
              match = false;
            }
          })
          if (match) {
            this.loading = false
            return 'conservative';
          }
        }
        if (this.selectedProducts.length === fastPreset.positive.length) {
          let match = true
          fastPreset.positive.forEach(item => {
            const find = this.selectedProducts.find(ele => ele.name === item.name) || {};
            if (find.investmentRate - item.investmentRate !== 0) {
              match = false;
            }
          })
          if (match) {
            this.loading = false
            return 'positive';
          }
        }
      }
      this.loading = false
      return '';
    }
  }
}
</script>
