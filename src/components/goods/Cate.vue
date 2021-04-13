<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <!-- 分类表格: data(设置数据源) :columns(设置表格中列配置信息) :selection-type(是否有复选框) :expand-type(是否展开数据) show-index(是否设置索引列) index-text(设置索引列头) border(是否添加纵向边框) :show-row-hover(是否鼠标悬停高亮)-->
            <tree-table
                class="treeTable"
                :data="catelist"
                :columns="columns"
                :selection-type="false"
                :expand-type="false"
                show-index
                index-text="#"
                border
                :show-row-hover="false"
            >
                <!-- 是否有效区域， 设置对应的模板列： slot="isok"(与columns中设置的template一致) -->
                <template slot="isok" slot-scope="scope">
                    <i
                        class="el-icon-success"
                        v-if="scope.row.cat_deleted === false"
                        style="color:lightgreen"
                    ></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope>
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>
        <!-- 添加分类对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addCateDialogVisible"
            width="30%"
            @close="addCateDialogClosed"
        >
            <!-- 内容主体区 -->
            <el-form
                :model="addCateForm"
                :rules="addCateFormRules"
                ref="addCateFormRef"
                label-width="70px"
            >
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!-- 添加级联菜单显示父级分类 -->
                    <!-- expandTrigger='hover'(鼠标悬停触发级联) v-model(设置级联菜单绑定数据) :options(指定级联菜单数据源)  :props(用来配置数据显示的规则)clearable(提供“X”号完成删除文本功能)-->
                    <el-cascader
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="cascaderProps"
                        @change="parentCateChanged"
                        clearable
                        filterable
                        style="width: 100%"
                    ></el-cascader>
                </el-form-item>
            </el-form>
            <!-- 底部按钮区 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑分类的对话框 -->
        <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%">
            <el-form
                :model="editCateForm"
                :rules="editCateFormRules"
                ref="editCateFormRef"
                label-width="100px"
            >
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="eidtCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 查询条件
            queryInfo: {
                type: 3,
                // 当前的页数
                pagenum: 1,
                // 当前每页显示多少条数据
                pagesize: 5
            },
            total: 0,
            // 所有分类列表
            catelist: [],
            // 自定义表格分类数据列
            columns: [
                { label: '分类名称', prop: 'cat_name' },
                // type:'template'(将该列设置为模板列)，template:'isok'(设置该列模板的名称为isok)
                {
                    label: '是否有效',
                    type: 'template',
                    template: 'isok'
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                },
                { label: '操作', type: 'template', template: 'opt' }
            ],
            // 监控添加分类的显示与隐藏
            addCateDialogVisible: false,
            // 添加分类的表单数据
            addCateForm: {
                // 分类名称
                cat_name: '',
                // 添加分类的父级id，0则表示父级为0.添加一级分类
                cat_pid: 0,
                // 添加分类的等级，0则表示添加一级分类
                cat_level: 0
            },
            // 添加分类校验规则
            addCateFormRules: {
                // 验证规则
                cat_name: [
                    {
                        required: true,
                        message: '请输入分类名称',
                        trigger: 'blur'
                    }
                ]
            },
            // 保存1,2级父级分类的列表
            parentCateList: [],
            // 指定级联选择器的配置对象
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: true,
                expandTrigger: 'hover'
            },
            // 选中的父级分类的Id数组
            selectedKeys: [],
            // 编辑对话框 控制
            editCateDialogVisible: false,
            // 编辑分类表单验证
            editCateFormRules: {
                cat_name: [
                    {
                        required: true,
                        message: '请输入分类名称',
                        trigger: 'blur'
                    }
                ]
            },
            // 编辑表单 绑定对象
            editCateForm: ''
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories', {
                params: this.queryInfo
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类列表失败')
            }
            // console.log(res.data)
            // 数据列表，赋值给catelist
            this.catelist = res.data.result
            // 为总数据条数赋值
            this.total = res.data.total
            // console.log(this.catelist)
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            // console.log(newSize)
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 监听页码值 改变的事件
        handleCurrentChange(newPage) {
            // console.log(newPage)
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        showAddCateDialog() {
            // 调用getParentCateList获取分类列表
            this.getParentCateList()
            // 显示添加分类对话框
            this.addCateDialogVisible = true
        },
        // 获取父级分类数据列表
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', {
                params: { type: 2 }
            })

            if (res.meta.status !== 200) {
                return this.$message.error('获取父级分类列表数据失败')
            }
            // console.log(res.data)
            this.parentCateList = res.data
            // console.log(this.parentCateList)
        },
        // 级联菜单中选择项发生变化时触发
        parentCateChanged() {
            // console.log(this.selectedKeys)
            // 如果用户选择了父级分类
            if (this.selectedKeys.length > 0) {
                // 则将数组中的最后一项设置为父级分类
                this.addCateForm.cat_pid = this.selectedKeys[
                    this.selectedKeys.length - 1
                ]
                // level也要跟着发生变化
                this.addCateForm.cat_level = this.selectedKeys.length
                return 0
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 点击添加分类
        addCate() {
            this.$refs.addCateFormRef.validate(async valid => {
                if (!valid) return
                // 可以发起添加分类的请求
                const { data: res } = await this.$http.post(
                    'categories',
                    this.addCateForm
                )
                if (res.meta.status !== 201) {
                    return this.$message.error('添加分类失败')
                }
                this.$message.success('添加分类成功')
                // 刷新分类列表
                this.getCateList()
                // 隐藏对话框
                this.addCateDialogVisible = false
            })
        },
        // 当关闭添加分类对话框时，重置表单
        addCateDialogClosed() {
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
        },
        // 展示编辑分类
        async showEditCateDialog(id) {
            const { data: res } = await this.$http.get('categories/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('获取分类失败！')
            }
            this.editCateForm = res.data
            this.editCateDialogVisible = true
        },
        // 编辑分类名
        eidtCate() {
            this.$refs.editCateFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
                if (res.meta.status !== 200) {
                    return this.$message.error('更新分类名失败！')
                }
                this.$message.success('更新分类名成功！')
                this.getCateList()
                this.editCateDialogVisible = false
            })
        },
        // 删除商品分类
        async removeCate(id) {
            const confirmResult = await this.$confirm(
                '此操作将永久删除该分类, 是否继续?',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除！')
            }
            const { data: res } = await this.$http.delete('categories/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品分类失败！')
            }
            this.$message.success('删除商品分类成功！')
            this.getCateList()
        }
    }
}
</script>

<style lang='less' scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;
}
</style>
