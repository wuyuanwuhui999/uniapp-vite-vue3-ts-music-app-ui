<template>
	<view @click="useClick" class="no-data"><text>{{ text }}</text></view>
</template>

<script setup lang="ts">
    import { defineProps, defineEmits } from 'vue';
    const emits = defineEmits(['onClick']);
	const prop = defineProps({
		text:{
			type:String,
			require:true,
			default:'暂无数据'
		}
	})
    const useClick = ()=>{
        emits('onClick')
    }
</script>

<style lang="less">
	@import '../theme/style.less';	
</style>
