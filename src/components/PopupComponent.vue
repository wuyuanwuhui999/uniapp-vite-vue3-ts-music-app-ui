<template>
    <uni-popup ref="popup" class="popup-wrapper"  type="dialog">
        <view class="dialog-wrapper">
            <view class="dialog-box">
                <view class="dialog-header"><text>提示</text></view>
                <view class="dialog-content">
                    <text class="field-text">{{ text }}</text>
                </view>
                <view class="dialog-btn">
                    <text class="btn-cancle" @click="onCancle">取消</text>
                    <text class="btn-sure" @click="onSure">确定</text>
                </view>
            </view>
        </view>
    </uni-popup>
</template>
<script lang="ts" setup>
    import {type PropType,defineEmits,ref,defineExpose} from "vue";
    import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue';
    
    const popup = ref<null | InstanceType<typeof uniPopup>>(null);

    const {text} = defineProps({
        text:{
            type:String as PropType<string>,
            default:""
        }
    })
    const emit = defineEmits(["onSure","onCancle"])

    const onSure = () => {
        emit("onSure");
    }

    const onCancle = () => {
        emit("onCancle");
        popup.value?.close()
    }

    defineExpose({
        popup
    })
</script>
<style lang="less" scoped>
    @import '../theme/size.less';
	@import '../theme/color.less';
    .popup-wrapper{
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.2);
        top: 0;
        left: 0;
        .dialog-wrapper{
            display: flex;
            height: 100vh;
            width: 100%;
            align-items: center;
            justify-content: center;
            .dialog-box{
                width: 80%;
                left: 50%;
                top: 50%;
                border-radius: @module-border-radius;
                background-color: @white-background-color;
                .dialog-header{
                    padding: @page-padding;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    box-sizing: border-box;
                }
                .dialog-content{
                    padding: calc(@page-padding * 2);
                    display: flex;
                    box-sizing: border-box;
                    justify-content: center;
                }
                .dialog-btn{
                    display: flex;
                    border-top: 1rpx solid @page-background-color;
                    .btn-cancle{
                        height: @btn-height;
                        flex: 1;
                        justify-content: center;
                        align-items: center;
                        display: flex;
                        color: @sub-title-color;
                    }
                    .btn-sure{
                        flex: 1;
                        color: @line-color;
                        height: @btn-height;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-weight: bold;
                        border-left: 1rpx solid @page-background-color;;
                    }
                }
            }
        }
    }
</style>